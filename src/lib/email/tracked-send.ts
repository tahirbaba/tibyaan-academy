import { getDb } from "@/lib/db";
import { emailEvents } from "@/lib/db/schema";
import { MAIL_FROM, mailFromIsUnsendable, MAIL_FROM_ADDRESS } from "@/lib/site-config";
import { sendFailureAlert } from "@/lib/alerts";

/**
 * Send an email AND record it, so its fate is visible.
 *
 * Built for the verification/reset mail that stands in front of every new
 * student. A verification email that silently never arrives loses a student in
 * the UK, US, Canada or Australia who will never write to say it didn't come.
 * Every send lands a row in email_events; a later Resend webhook updates it to
 * delivered or bounced. Silence then means "delivered and fine", not "no idea".
 *
 * A send REFUSED at the provider (bad address, unverified domain) is recorded
 * as "rejected" and alerts support immediately. Never throws — mail failing
 * must not take down the flow that sent it; the caller reads the result.
 */
export type TrackedSend =
  | { ok: true; id: string | null }
  | { ok: false; reason: string };

export async function sendTrackedEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** "verification" | "password_reset" | ... — free text, no migration to add one. */
  type: string;
  /** The user this is for, when known. */
  userId?: string | null;
}): Promise<TrackedSend> {
  const { to, subject, html, text, type, userId = null } = opts;
  const db = getDb();

  const record = async (
    status: "sent" | "rejected",
    providerId: string | null,
    detail: string | null
  ) => {
    try {
      await db.insert(emailEvents).values({ userId, recipient: to, type, status, providerId, detail });
    } catch (e) {
      // The record failing must not fail the send; but it IS a hole in the
      // observability, so it is surfaced rather than swallowed.
      console.error("[tracked-send] could not record email_events row:", e);
    }
  };

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    await record("rejected", null, "RESEND_API_KEY not set");
    await alertRejected(type, to, "RESEND_API_KEY not set");
    return { ok: false, reason: "RESEND_API_KEY not set" };
  }
  if (mailFromIsUnsendable()) {
    const reason = `MAIL_FROM_ADDRESS ${MAIL_FROM_ADDRESS} is on an unsendable domain`;
    await record("rejected", null, reason);
    await alertRejected(type, to, reason);
    return { ok: false, reason };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: MAIL_FROM, to, subject, text, html }),
    });

    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 400);
      await record("rejected", null, `HTTP ${res.status}: ${detail}`);
      await alertRejected(type, to, `Resend rejected the send (HTTP ${res.status}): ${detail}`);
      return { ok: false, reason: `Resend rejected the send (HTTP ${res.status})` };
    }

    const body = (await res.json().catch(() => ({}))) as { id?: string };
    await record("sent", body.id ?? null, null);
    return { ok: true, id: body.id ?? null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await record("rejected", null, reason);
    await alertRejected(type, to, reason);
    return { ok: false, reason };
  }
}

/** A refused send is a student who may never get in. Loud, on the first one. */
async function alertRejected(type: string, to: string, reason: string): Promise<void> {
  await sendFailureAlert({
    source: `email:${type}`,
    summary: `A ${type} email was refused at send — the recipient did not get it`,
    error: new Error(reason),
    context: { recipient: to, type },
  });
}
