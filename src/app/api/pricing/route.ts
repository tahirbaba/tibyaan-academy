import { NextResponse } from "next/server";
import { getPricing } from "@/lib/pricing-server";

/**
 * GET /api/pricing — the public price list, for client pages that cannot be
 * handed it by a server component. Prices are public information.
 *
 * A failed read is a 500, never a 200 with default numbers.
 */
export async function GET() {
  try {
    const pricing = await getPricing();
    return NextResponse.json({ pricing });
  } catch {
    // getPricing() has already alerted.
    return NextResponse.json(
      { error: "Pricing is temporarily unavailable" },
      { status: 500 }
    );
  }
}
