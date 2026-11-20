import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getDb } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { requireDbAdmin } from "@/lib/db-role";
import { sendFailureAlert } from "@/lib/alerts";
import {
  PRICING_DEFAULTS,
  PRICING_SETTINGS_KEY,
  pricingConfigSchema,
} from "@/lib/pricing";
import {
  PRICING_CACHE_TAG,
  readPricingUncached,
} from "@/lib/pricing-server";
import { eq } from "drizzle-orm";

/**
 * GET  /api/admin/pricing — current pricing config (+ whether it is the default)
 * PUT  /api/admin/pricing — replace it
 *
 * Saving here changes what NEW checkouts are charged. It never touches an
 * existing Stripe subscription: those keep the amount they were created with.
 */
export async function GET() {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;

  try {
    const db = getDb();
    const rows = await db
      .select({ updatedAt: adminSettings.updatedAt })
      .from(adminSettings)
      .where(eq(adminSettings.key, PRICING_SETTINGS_KEY))
      .limit(1);
    const pricing = await readPricingUncached();
    return NextResponse.json({
      pricing,
      defaults: PRICING_DEFAULTS,
      isDefault: rows.length === 0,
      updatedAt: rows[0]?.updatedAt ?? null,
    });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/pricing GET",
      summary: "Admin could not load the pricing settings.",
      error,
    });
    return NextResponse.json(
      { error: "Could not load pricing settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireDbAdmin();
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = pricingConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid pricing values", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const db = getDb();
    const value = JSON.stringify(parsed.data);
    // One statement: `key` is unique, so this is an atomic create-or-replace.
    await db
      .insert(adminSettings)
      .values({ key: PRICING_SETTINGS_KEY, value, updatedBy: auth.user.id })
      .onConflictDoUpdate({
        target: adminSettings.key,
        set: { value, updatedAt: new Date(), updatedBy: auth.user.id },
      });

    // Read back what is now stored, so the response is the saved truth rather
    // than an echo of the request.
    const saved = await readPricingUncached();
    revalidateTag(PRICING_CACHE_TAG, { expire: 0 });
    return NextResponse.json({ pricing: saved });
  } catch (error) {
    await sendFailureAlert({
      source: "/api/admin/pricing PUT",
      summary: "Saving the pricing settings failed — prices were NOT changed.",
      error,
    });
    return NextResponse.json(
      { error: "Could not save pricing settings" },
      { status: 500 }
    );
  }
}
