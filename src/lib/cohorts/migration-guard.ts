import { sendFailureAlert } from "@/lib/alerts";

const UNDEFINED_TABLE = "42P01";

/**
 * Deploy-ordering safety net for the two DASHBOARD widgets only.
 *
 * The cohort tables are created by docs/migration-cohorts.sql. If the code is
 * deployed before that migration is run, a cohort query fails with 42P01
 * ("relation cohorts does not exist"). On the dedicated group-class pages that
 * is allowed to be a loud error. But the widgets sit on the student and
 * teacher dashboards, and one missing migration must not take every dashboard
 * down — that is the September 2026 dars incident again
 * (docs/schema-and-migrations.md).
 *
 * So: exactly one error is recoverable here — the cohort tables not existing —
 * and it is not quiet: it emails an alert (once per server process) and the
 * widget is left out. Every other error is rethrown.
 *
 * Returns `null` only for "tables not migrated yet"; the caller renders
 * nothing for null, which is true: without the tables there are no cohorts.
 */
let alerted = false;

export async function cohortsIfMigrated<T>(
  source: string,
  query: () => Promise<T>
): Promise<T | null> {
  try {
    return await query();
  } catch (error) {
    const cause = (error as { cause?: unknown })?.cause ?? error;
    const code = (cause as { code?: string })?.code;
    const message = String((cause as { message?: string })?.message ?? "");
    const isMissingCohortTable =
      code === UNDEFINED_TABLE && /cohort/.test(message);
    if (!isMissingCohortTable) throw error;

    if (!alerted) {
      alerted = true;
      await sendFailureAlert({
        source,
        summary:
          "The cohort tables do not exist in this database — the deployed code is ahead of docs/migration-cohorts.sql. Group class pages are failing; the dashboard widget is hidden. Run the migration.",
        error,
      });
    }
    return null;
  }
}
