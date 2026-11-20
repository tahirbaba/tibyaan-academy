import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { referrals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { familyDiscountPercent } from "@/lib/pricing";
import { getPricingForCharge } from "@/lib/pricing-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { familyCode } = await request.json();

    if (!familyCode) {
      return Response.json(
        { error: "Missing family code" },
        { status: 400 }
      );
    }

    // Find the referral by code
    const existingReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referralCode, familyCode));

    if (existingReferrals.length === 0) {
      return Response.json(
        { error: "Invalid family code" },
        { status: 404 }
      );
    }

    // Count how many students are in this family
    const referrerId = existingReferrals[0].referrerId;
    const familyMembers = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));

    // Student index: 2nd student, 3rd student, etc.
    const studentIndex = familyMembers.length + 1;
    const pricing = await getPricingForCharge();
    const discount = familyDiscountPercent(pricing, studentIndex);

    // Create referral record
    await db.insert(referrals).values({
      referrerId,
      referredId: user.id,
      referralCode: familyCode,
      rewardMonths: 1,
    });

    return Response.json({
      discount, // percentage
      studentIndex,
      message: `Family discount applied: ${discount}% off`,
    });
  } catch (error) {
    console.error("Family discount error:", error);
    return Response.json(
      { error: "Failed to apply family discount" },
      { status: 500 }
    );
  }
}
