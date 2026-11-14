import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { adminSettings } from "@/lib/db/schema";
import { sendFailureAlert } from "@/lib/alerts";
import {
  PRICING_DEFAULTS,
  PRICING_SETTINGS_KEY,
  parsePricingConfig,
  type PricingConfig,
} from "@/lib/pricing";

export const PRICING_CACHE_TAG = "pricing-config";

/**
 * Read the pricing config straight from the database.
 *
 * No row  -> the defaults in src/lib/pricing.ts (an admin has never changed
 *            anything; that is a real, known state).
 * Row     -> must parse completely, or this throws.
 * Failure -> throws. A failed read is NOT "use the defaults": if an admin has
 *            set $60 and the read fails, showing or charging the default $55
 *            would be a confident wrong number. See docs/silent-failure-sites.md.
 */
export async function readPricingUncached(): Promise<PricingConfig> {
  const db = getDb();
  const rows = await db
    .select({ value: adminSettings.value })
    .from(adminSettings)
    .where(eq(adminSettings.key, PRICING_SETTINGS_KEY))
    .limit(1);

  if (rows.length === 0) return PRICING_DEFAULTS;
  return parsePricingConfig(rows[0].value);
}

const readPricingCached = unstable_cache(
  readPricingUncached,
  [PRICING_CACHE_TAG],
  { tags: [PRICING_CACHE_TAG], revalidate: 300 }
);

/**
 * Pricing for display (pages, metadata, JSON-LD). Cached for five minutes and
 * invalidated the moment an admin saves new prices.
 */
export async function getPricing(): Promise<PricingConfig> {
  try {
    return await readPricingCached();
  } catch (error) {
    await sendFailureAlert({
      source: "pricing:getPricing",
      summary:
        "The pricing settings could not be read — pages that show prices are failing rather than showing a guess.",
      error,
    });
    throw error;
  }
}

/**
 * Pricing for charging money (checkout). Never cached: the amount sent to
 * Stripe must be the amount saved right now.
 */
export async function getPricingForCharge(): Promise<PricingConfig> {
  return readPricingUncached();
}

/**
 * For site-wide chrome only (root layout JSON-LD, default meta description).
 *
 * Those run on EVERY page, so a pricing read failure must not take the whole
 * site down. The caller gets `null` and must then OMIT the price claim — never
 * substitute a default number. Omitting a claim is honest; guessing one is not.
 * The failure is still alerted by getPricing().
 */
export async function getPricingOrNull(): Promise<PricingConfig | null> {
  try {
    return await getPricing();
  } catch {
    return null;
  }
}
