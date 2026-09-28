import { NextResponse } from "next/server";
import { withCron } from "@/lib/cron-auth";
import { sendCanary } from "@/lib/alerts";

/**
 * The weekly proof that alerting still works.
 *
 * Without this, no email means either "nothing has failed" or "the channel is
 * dead", and those look identical from the inbox. That ambiguity is how the
 * dars cron failed every morning from May to September with nobody told.
 *
 * With it, silence has a meaning: a Monday with no canary is itself the
 * signal. The absence of mail becomes evidence rather than the lack of it.
 *
 * Monday 09:00 UTC. Deliberately a different day and hour from every other
 * job, so a canary arriving says the channel works independently of them.
 */
export const GET = withCron("/api/alerts/canary", handler);
export const POST = withCron("/api/alerts/canary", handler, { allowAdminSecret: true });

async function handler(): Promise<Response> {
  const result = await sendCanary();

  if (!result.delivered) {
    // Returning non-2xx makes withCron alert as well — which will also fail,
    // and land in the logs under [alert-undelivered]. Both paths being broken
    // is exactly the state worth shouting about rather than returning 200.
    return NextResponse.json(
      { ok: false, reason: result.reason },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, sentTo: result.sentTo });
}
