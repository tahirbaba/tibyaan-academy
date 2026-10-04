import { serve } from "inngest/next";
import { NextResponse } from "next/server";
import { inngest } from "@/lib/inngest";
import { sendFailureAlert } from "@/lib/alerts";
import { generateBlogArticle } from "@/inngest/functions/generate-blog";
import { blogQueueManager } from "@/inngest/functions/blog-queue";
import {
  trialExpiryWorkflow,
  welcomeWorkflow,
  inactivityWorkflow,
  apiLimitMonitor,
  weeklySeoreport,
} from "@/inngest/functions/automation-workflows";

/**
 * Inngest endpoint.
 *
 * Inngest's own `serve()` needs INNGEST_SIGNING_KEY to operate in production;
 * without it the handler throws and the endpoint returns an opaque 500. That is
 * exactly a silent failure: for four months the five automation workflows
 * (trial-expiry, welcome, inactivity, API-limit monitor, weekly SEO report)
 * never ran, the endpoint 500'd, and because Inngest never ran its onFailure
 * handler never fired — so nothing was ever alerted. The daily dars job and the
 * Monday canary were never affected: those are Vercel crons, not Inngest.
 *
 * So: when the keys are absent we do NOT let it fail opaquely. We return a 503
 * that names the cause, and we alert once (throttled) so someone is told the
 * workflows are off. When the keys are set, this passes straight through to the
 * real Inngest handler and the alert never fires.
 */
const SIGNING_KEY = process.env.INNGEST_SIGNING_KEY;
const EVENT_KEY = process.env.INNGEST_EVENT_KEY;
const configured = Boolean(SIGNING_KEY && EVENT_KEY);

// One alert per warm instance per hour: the endpoint is pinged by Inngest sync
// and by health probes, and an alert on every hit would be its own noise.
let lastAlertAt = 0;
async function alertUnconfigured(): Promise<void> {
  const now = Date.now();
  if (now - lastAlertAt < 60 * 60 * 1000) return;
  lastAlertAt = now;
  await sendFailureAlert({
    source: "inngest:endpoint",
    summary:
      "Inngest is unconfigured — trial-expiry, welcome, inactivity, API-limit " +
      "and weekly-SEO workflows are not running",
    error: new Error(
      "INNGEST_SIGNING_KEY / INNGEST_EVENT_KEY not set in this environment"
    ),
    context: { hasSigningKey: Boolean(SIGNING_KEY), hasEventKey: Boolean(EVENT_KEY) },
  }).catch(() => {});
}

async function unconfiguredResponse(): Promise<Response> {
  await alertUnconfigured();
  return NextResponse.json(
    {
      error: "Inngest is not configured in this environment.",
      detail:
        "INNGEST_SIGNING_KEY and INNGEST_EVENT_KEY are not set, so background " +
        "workflows are not running. Set both in Vercel to enable them.",
      affected: [
        "trial-expiry",
        "welcome",
        "inactivity",
        "api-limit-monitor",
        "weekly-seo-report",
      ],
    },
    { status: 503 }
  );
}

const handlers = configured
  ? serve({
      client: inngest,
      functions: [
        generateBlogArticle,
        blogQueueManager,
        trialExpiryWorkflow,
        welcomeWorkflow,
        inactivityWorkflow,
        apiLimitMonitor,
        weeklySeoreport,
      ],
    })
  : null;

export const GET = handlers ? handlers.GET : unconfiguredResponse;
export const POST = handlers ? handlers.POST : unconfiguredResponse;
export const PUT = handlers ? handlers.PUT : unconfiguredResponse;
