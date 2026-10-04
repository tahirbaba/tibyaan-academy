import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { alertChannelStatus } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error" | "unconfigured"> = {};
  let healthy = true;

  // Check database connectivity
  try {
    const db = getDb();
    await db.execute(sql`SELECT 1`);
    checks.database = "ok";
  } catch {
    checks.database = "error";
    healthy = false;
  }

  // Check critical environment variables. STRIPE_SECRET_KEY is deliberately NOT
  // here: Stripe does not operate in Pakistan, so the key is intentionally
  // absent. Listing it made /api/health report "degraded" permanently, which
  // taught everyone to ignore the check — a health probe that cries wolf is as
  // useless as one that stays silent. These are the vars whose absence really
  // means the platform is broken.
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "ANTHROPIC_API_KEY",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment = missingVars.length === 0 ? "ok" : "error";
  if (missingVars.length > 0) healthy = false;

  // Inngest runs the five automation workflows. Without its keys the endpoint
  // 500s and those workflows do not run — a state that went unnoticed for
  // months. Surface it by name here. It is reported as "unconfigured", not
  // "error": it is a known pending state (the keys are being set), and conflating
  // it with a real outage would bring back the cry-wolf problem above. The
  // /api/inngest endpoint itself alerts when it is hit while unconfigured.
  const inngestConfigured = Boolean(
    process.env.INNGEST_SIGNING_KEY && process.env.INNGEST_EVENT_KEY
  );
  checks.inngest = inngestConfigured ? "ok" : "unconfigured";

  // The alerting channel itself. Without this, a broken alerting path is only
  // discovered when something else fails and no one is told — which is exactly
  // how the dars cron ran unnoticed from May to September.
  const alerting = alertChannelStatus();
  checks.alerting = alerting.ok ? "ok" : "error";
  if (!alerting.ok) healthy = false;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      checks,
      // Named, because "alerting: error" with no reason is its own dead end.
      ...(alerting.ok ? {} : { alertingProblem: alerting.reason, since: alerting.at }),
      // Which variables are missing, not just that some are. Names only.
      ...(missingVars.length ? { missingEnv: missingVars } : {}),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev",
      timestamp: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 }
  );
}
