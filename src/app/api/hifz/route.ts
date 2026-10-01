import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { hifzTracker } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { SURAHS } from "@/lib/quran/metadata";

// One source of truth — the verified Tanzil dataset. This was an inline copy
// of the per-surah counts; it is now derived from the shared constant so it
// cannot drift from the surah list, the entry form or the total.
const SURAH_AYAHS: Record<number, number> = Object.fromEntries(
  SURAHS.map((s) => [s.number, s.ayahCount])
);

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const db = getDb();
    const records = await db
      .select()
      .from(hifzTracker)
      .where(eq(hifzTracker.studentId, user.id))
      .orderBy(desc(hifzTracker.createdAt))
      .limit(500);

    // Calculate totals
    const totalAyaatMemorized = records
      .filter((r) => r.type === "sabaq")
      .reduce((sum, r) => sum + (Number(r.ayahTo) - Number(r.ayahFrom) + 1), 0);

    const uniqueSurahs = new Set(
      records.filter((r) => r.type === "sabaq").map((r) => r.surahNumber)
    ).size;

    const scores = records.filter((r) => r.score != null).map((r) => Number(r.score));
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

    // Current streak (consecutive days with any entry)
    const dates = [...new Set(records.map((r) => r.createdAt.toISOString().slice(0, 10)))].sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(new Date(today).getTime() - i * 86400000).toISOString().slice(0, 10);
      if (dates[i] === expected) streak++;
      else break;
    }

    return NextResponse.json({
      records,
      stats: { totalAyaatMemorized, uniqueSurahs, avgScore, streak },
      surahAyahs: SURAH_AYAHS,
    });
  } catch (err) {
    console.error("GET /api/hifz error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { surahNumber, ayahFrom, ayahTo, type, assessment, notes } = body;

    if (!surahNumber || !ayahFrom || !ayahTo || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const scoreMap: Record<string, number> = { good: 90, okay: 65, difficult: 40 };

    const db = getDb();
    const [inserted] = await db
      .insert(hifzTracker)
      .values({
        studentId: user.id,
        surahNumber: Number(surahNumber),
        ayahFrom: Number(ayahFrom),
        ayahTo: Number(ayahTo),
        type,
        status: "pending",
        score: assessment ? scoreMap[assessment] ?? null : null,
        aiFeedback: notes || null,
        lastRecitedAt: new Date(),
        nextRevisionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .returning();

    return NextResponse.json({ success: true, record: inserted });
  } catch (err) {
    console.error("POST /api/hifz error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
