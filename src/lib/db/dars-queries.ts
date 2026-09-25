import { eq, desc, type SQL } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { dailyDars } from "@/lib/db/schema";
import { sendFailureAlert } from "@/lib/alerts";

/**
 * Reading daily_dars without letting deploy order be load-bearing.
 *
 * What went wrong, so it is not repeated: poster_url was added to the Drizzle
 * schema before the migration that creates the column had been run. A bare
 * db.select() asks for every column in the schema, so Postgres rejected the
 * whole query with 42703 "column poster_url does not exist" and every dars
 * detail page returned 500. The poster code was fine; the ordering was not.
 *
 * Code and schema now tolerate being ahead of the database. A missing NEW
 * column costs that one field, not the page: the query is retried without it
 * and posterUrl comes back null, which is exactly what the pages already
 * handle (they fall back to the on-demand poster route). That is a real
 * degradation and it is alerted, not hidden.
 *
 * This only ever covers columns listed in RECOVERABLE_COLUMNS. A missing
 * column that is not in that list is a genuine schema mismatch and still
 * throws — the point is to survive a half-landed deploy of a known-optional
 * field, not to paper over any schema drift at all.
 */

/** Postgres: undefined_column. */
const UNDEFINED_COLUMN = "42703";

/**
 * Columns that may legitimately not exist yet, because the code that uses them
 * can ship before their migration runs. Add to this ONLY alongside a column
 * that is nullable and whose absence degrades one feature rather than a page.
 */
const RECOVERABLE_COLUMNS = ["poster_url"] as const;

/** Every column except the recoverable ones, listed explicitly. */
const BASE_COLUMNS = {
  id: dailyDars.id,
  slug: dailyDars.slug,
  titleUr: dailyDars.titleUr,
  titleAr: dailyDars.titleAr,
  titleEn: dailyDars.titleEn,
  titleFr: dailyDars.titleFr,
  titleId: dailyDars.titleId,
  contentUr: dailyDars.contentUr,
  contentAr: dailyDars.contentAr,
  contentEn: dailyDars.contentEn,
  contentFr: dailyDars.contentFr,
  contentId: dailyDars.contentId,
  category: dailyDars.category,
  sourceReference: dailyDars.sourceReference,
  generatedBy: dailyDars.generatedBy,
  status: dailyDars.status,
  reviewedBy: dailyDars.reviewedBy,
  reviewedAt: dailyDars.reviewedAt,
  reviewNote: dailyDars.reviewNote,
  isPublished: dailyDars.isPublished,
  publishedAt: dailyDars.publishedAt,
  viewCount: dailyDars.viewCount,
  createdAt: dailyDars.createdAt,
} as const;

const FULL_COLUMNS = { ...BASE_COLUMNS, posterUrl: dailyDars.posterUrl } as const;

/**
 * The same shape a bare select() produced, so call sites did not have to
 * change their types — including posterUrl being nullable, which is the whole
 * point: a missing column reads as null, exactly like a row without a poster.
 */
export type DarsRow = typeof dailyDars.$inferSelect;

function missingRecoverableColumn(error: unknown): string | null {
  const cause = (error as { cause?: unknown })?.cause ?? error;
  const code = (cause as { code?: string })?.code;
  if (code !== UNDEFINED_COLUMN) return null;

  const message = String((cause as { message?: string })?.message ?? "");
  return RECOVERABLE_COLUMNS.find((c) => message.includes(c)) ?? null;
}

/** One alert per process per column, rather than one per page view. */
const alerted = new Set<string>();

async function alertOnce(column: string, error: unknown, where: string): Promise<void> {
  if (alerted.has(column)) return;
  alerted.add(column);

  await sendFailureAlert({
    source: "daily_dars schema",
    summary:
      `Column "${column}" is missing from the database, so it is being read as null. ` +
      `The deployed code is ahead of the migrations — run the pending migration.`,
    error,
    context: { column, queriedFrom: where },
  });
}

/**
 * Runs the query with every column; if a recoverable column is missing, runs
 * it again without that column and fills it in as null.
 *
 * THROWS if the query fails for any other reason. Callers must let that
 * surface — see the dars list page for why an empty list is worse than an
 * error page.
 */
async function selectDars(
  where: SQL | undefined,
  limit: number,
  orderByPublished: boolean,
  callSite: string
): Promise<DarsRow[]> {
  const db = getDb();

  const run = async (columns: Record<string, unknown>) => {
    let q = db.select(columns as typeof FULL_COLUMNS).from(dailyDars).$dynamic();
    if (where) q = q.where(where);
    if (orderByPublished) q = q.orderBy(desc(dailyDars.publishedAt));
    return (await q.limit(limit)) as DarsRow[];
  };

  try {
    return await run(FULL_COLUMNS);
  } catch (error) {
    const column = missingRecoverableColumn(error);
    if (!column) throw error;

    await alertOnce(column, error, callSite);

    const rows = await run(BASE_COLUMNS);
    return rows.map((r) => ({ ...r, posterUrl: null }) as DarsRow);
  }
}

/** Published dars, newest first, for the list page. */
export function listDars(where: SQL | undefined, limit: number, callSite: string) {
  return selectDars(where, limit, true, callSite);
}

/** One dars by slug. Returns undefined when there is no such row. */
export async function getDarsBySlug(slug: string, callSite: string): Promise<DarsRow | undefined> {
  const rows = await selectDars(eq(dailyDars.slug, slug), 1, false, callSite);
  return rows[0];
}
