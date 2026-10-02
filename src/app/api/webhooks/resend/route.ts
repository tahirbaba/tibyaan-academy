import { NextResponse, type NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { emailEvents } from "@/lib/db/schema";
import { sendFailureAlert } from "@/lib/alerts";

export const runtime = "nodejs";

/**
 * Resend delivery webhook — the other half of the observability.
 *
 * tracked-send records a send as "sent"; this updates that row when the
 * provider reports what actually happened: delivered, bounced, or marked as
 * spam. A bounce or complaint alerts support, because that is the silent-loss
 * case — a student whose verification mail never landed, who will not write in.
 *
 * Signature is verified (Svix scheme, which Resend uses) before anything is
 * trusted: the body is signed data from an external caller, not an instruction.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  if (!secret) {
    // Fail closed. Without the secret we cannot trust the payload, so we do not
    // act on it — but this means the webhook is effectively off, which is worth
    // knowing, so it is logged loudly.
    console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set — rejecting webhook");
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const raw = await request.text();
  if (!verifySvixSignature(request, raw, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: ResendEvent;
  try {
    event = JSON.parse(raw) as ResendEvent;
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  const providerId = event.data?.email_id;
  if (!providerId) return NextResponse.json({ ok: true, ignored: "no email_id" });

  const status = STATUS_BY_EVENT[event.type];
  if (!status) return NextResponse.json({ ok: true, ignored: event.type });

  const db = getDb();
  try {
    await db
      .update(emailEvents)
      .set({ status, detail: describe(event), updatedAt: new Date() })
      .where(eq(emailEvents.providerId, providerId));
  } catch (e) {
    console.error("[resend-webhook] could not update email_events:", e);
  }

  // A bounce or a spam complaint is the loss we built this to catch.
  if (status === "bounced" || status === "complained") {
    await sendFailureAlert({
      source: "email:webhook",
      summary: `An email ${status} — the recipient did not receive it`,
      error: new Error(describe(event)),
      context: { emailId: providerId, event: event.type, to: event.data?.to },
    });
  }

  return NextResponse.json({ ok: true });
}

const STATUS_BY_EVENT: Record<string, "delivered" | "bounced" | "complained"> = {
  "email.delivered": "delivered",
  "email.bounced": "bounced",
  "email.complained": "complained",
};

interface ResendEvent {
  type: string;
  data?: { email_id?: string; to?: string[] | string; bounce?: { message?: string } };
}

function describe(event: ResendEvent): string {
  const to = Array.isArray(event.data?.to) ? event.data?.to.join(", ") : event.data?.to;
  const bounce = event.data?.bounce?.message;
  return [event.type, to, bounce].filter(Boolean).join(" · ").slice(0, 400);
}

/**
 * Svix signature check. The signed content is `${id}.${timestamp}.${body}`;
 * the secret is base64 after the "whsec_" prefix; the header carries one or
 * more space-separated `v1,<base64sig>` values.
 */
function verifySvixSignature(request: NextRequest, body: string, secret: string): boolean {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const sigHeader = request.headers.get("svix-signature");
  if (!id || !timestamp || !sigHeader) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  const expectedBuf = Buffer.from(expected);

  // The header may list several signatures; accept if any matches.
  for (const part of sigHeader.split(" ")) {
    const sig = part.split(",")[1];
    if (!sig) continue;
    const got = Buffer.from(sig);
    if (got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf)) return true;
  }
  return false;
}
