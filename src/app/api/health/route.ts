import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sql } from "drizzle-orm";
import { alertChannelStatus } from "@/lib/alerts";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};
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

  // Check critical environment variables
  const requiredEnvVars = [
    "DATABASE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "ANTHROPIC_API_KEY",
    "STRIPE_SECRET_KEY",
  ];

  const missingVars = requiredEnvVars.filter((v) => !process.env[v]);
  checks.environment = missingVars.length === 0 ? "ok" : "error";
  if (missingVars.length > 0) healthy = false;

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
