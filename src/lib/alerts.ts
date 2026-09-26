import {
  SUPPORT_EMAIL,
  MAIL_FROM,
  MAIL_FROM_ADDRESS,
  SITE_NAME,
  mailFromIsUnsendable,
} from "@/lib/site-config";

/**
 * Failure alerting: one email to SUPPORT_EMAIL when a scheduled job fails.
 *
 * The problem this solves: a cron with a wrong CRON_SECRET returns 401 and
 * nothing anywhere notices. The daily dars job stopped in May and was found in
 * September. Any failure now produces mail.
 *
 * Deliberately minimal — no dashboard, no new service, no new dependency. It
 * reuses the Resend key that already sends transactional mail.
 */

export interface FailureAlert {
  /** Where it failed, e.g. "cron:/api/dars/generate" or "inngest:blog-queue-manager". */
  source: string;
  /** One-line summary shown in the subject. */
  summary: string;
  /** Error object or message. */
  error?: unknown;
  /** Anything else worth having in the mail body. */
  context?: Record<string, unknown>;
}

function describeError(error: unknown): string {
  if (!error) return "(no error object)";
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\n${error.stack ?? "(no stack)"}`;
  }
  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Never throws and never rejects — alerting must not be able to fail the job it
 * is reporting on, or turn one failure into two.
 */
/**
 * Outcome of an alert attempt.
 *
 * sendFailureAlert no longer returns void. A caller that cannot tell whether
 * the warning was delivered cannot escalate, and an undelivered warning is
 * worse than the failure it was describing — it looks like all is well.
 */
export type AlertDelivery =
  | { delivered: true }
  | { delivered: false; reason: string };

/** Remembered so /api/health can report that the alerting channel is down. */
let lastDeliveryFailure: { at: string; reason: string } | null = null;

/**
 * The state of the alerting channel itself, for /api/health.
 *
 * This is the answer to "who warns you that the warning failed": the health
 * endpoint goes degraded the moment alerting cannot deliver, so the channel is
 * observable without waiting for something else to break first.
 */
export function alertChannelStatus(): { ok: boolean; reason?: string; at?: string } {
  if (mailFromIsUnsendable()) {
    return {
      ok: false,
      reason: `MAIL_FROM_ADDRESS (${MAIL_FROM_ADDRESS}) is on a domain no mail provider will send from`,
    };
  }
  if (!process.env.RESEND_API_KEY) {
    return { ok: false, reason: "RESEND_API_KEY is not set" };
  }
  if (lastDeliveryFailure) {
    return { ok: false, reason: lastDeliveryFailure.reason, at: lastDeliveryFailure.at };
  }
  return { ok: true };
}

export async function sendFailureAlert(alert: FailureAlert): Promise<AlertDelivery> {
  const { source, summary, error, context } = alert;

  const detail = describeError(error);
  const contextLines = context
    ? Object.entries(context)
        .map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`)
        .join("\n")
    : "";

  // Always log, so the failure is visible in Vercel logs even if mail is down.
  console.error(
    `[alert] ${source} — ${summary}\n${contextLines}\n${detail}`
  );

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return fail("RESEND_API_KEY is not set");
  }

  // Checked before the request rather than after the rejection, so the log
  // names the cause instead of quoting a provider error nobody reads.
  if (mailFromIsUnsendable()) {
    return fail(
      `MAIL_FROM_ADDRESS is ${MAIL_FROM_ADDRESS} — a free-mail domain cannot be verified, ` +
        `so the provider refuses every send. Set MAIL_FROM_ADDRESS to an address on a ` +
        `domain verified with Resend.`
    );
  }

  const body = [
    `Source:   ${source}`,
    `When:     ${new Date().toISOString()}`,
    contextLines,
    "",
    detail,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: SUPPORT_EMAIL,
        subject: `[${SITE_NAME}] Job failed: ${summary}`,
        text: body,
        html: `<pre style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:13px;line-height:1.5;white-space:pre-wrap">${escapeHtml(
          body
        )}</pre>`,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return fail(`Resend rejected the alert (HTTP ${response.status}): ${detail.slice(0, 300)}`);
    }

    // Delivered. Clear any remembered failure so health recovers by itself.
    lastDeliveryFailure = null;
    return { delivered: true };
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err));
  }
}

/**
 * Records an undelivered alert and returns the failure.
 *
 * Logs at error level with a distinctive, greppable prefix, and remembers the
 * reason so /api/health reports the channel as down until a send succeeds.
 * The wording is deliberate: the point is that a failure is now unreported,
 * not merely that an email bounced.
 */
function fail(reason: string): AlertDelivery {
  lastDeliveryFailure = { at: new Date().toISOString(), reason };
  console.error(
    "[alert-undelivered] An alert could not be delivered, so the failure it " +
      "was reporting is now unreported. Reason: " +
      reason
  );
  return { delivered: false, reason };
}

/**
 * `onFailure` handler for Inngest functions. Inngest calls this once, after all
 * retries for a run are exhausted — so one email per failed run, not per retry.
 *
 * Usage: `inngest.createFunction({ id: "x", onFailure: inngestFailureHandler("x"), ... })`
 */
export function inngestFailureHandler(functionId: string) {
  return async ({ error, event }: { error: unknown; event?: unknown }) => {
    const originalEvent = (event as { data?: { event?: { name?: string } } })
      ?.data?.event?.name;
    await sendFailureAlert({
      source: `inngest:${functionId}`,
      summary: `${functionId} failed after all retries`,
      error,
      context: originalEvent ? { triggeringEvent: originalEvent } : undefined,
    });
  };
}
