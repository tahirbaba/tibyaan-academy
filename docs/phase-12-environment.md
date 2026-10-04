# Phase 12 — Environment audit + login diagnosis

**Branch:** `phase-12-environment` · **Read-only.** Nothing was changed, no migration
run, no secret value printed or written. The Vercel values were read as **names and
types only** (no `decrypt`); `.env.local` was never created and `vercel env pull` was
never run.

**How "present in Vercel" was established:** `GET /v9/projects/{id}/env` (names + type +
target, no values). **How runtime effects were established:** reading the code path, plus
two live production probes noted inline. Anything not proven is marked **not determined**.

---

## Headline findings (the ones that change decisions)

1. **`src/lib/env.ts` validates nothing.** It defines a Zod schema whose comment says
   "Validated at app startup", but its only export `getServerEnv()` is **never called
   anywhere** (grep: one hit, the definition itself). So its "required" Stripe keys are
   not enforced — which is *why* production runs without them. A validator that validates
   nothing is a silent-failure-register entry; see "Register additions" below.
2. **The Inngest endpoint is dead in production.** `GET https://tibyaanacademy.com/api/inngest`
   returns **HTTP 500 `{"code":"internal_server_error"}`** (probed live). The signing/event
   keys are absent from Vercel and `serve()` passes none, so every background job is off
   (blog generation, trial-expiry, welcome, inactivity, API-limit monitor, weekly SEO report).
3. **`RESEND_WEBHOOK_SECRET` is a real gap, confirmed from code.** Without it
   `/api/webhooks/resend` returns **503 and processes nothing** (route lines 22–29), so
   Phase 2's delivery/bounce recording is receiving nothing. Confirmed, not assumed.
4. **The login two-press bug is a missing cache revalidation after auth** — code-level
   cause identified with evidence below; live trace marked *not determined* (needs a running
   instance, which this read-only phase cannot boot without env).
5. **`.env.example` is wrong in both directions at once** — it documents vars no code reads
   (dead config) *and* omits vars the code does read (`DIRECT_URL`, `WHATSAPP_ACCESS_TOKEN`,
   `TWILIO_*`, two feature flags). Both lists are below.

**Count note (rule 9):** the brief says `.env.example` documents 31 variables; I count **30**
assignments in the file. The 31st is likely `DIRECT_URL`, which the brief lists as *present in
Vercel* — but it is **not** in `.env.example` at all. So the real gap is slightly different
from the brief's framing, in the platform's favour on the Stripe side and against it on `DIRECT_URL`.

---

## Task 1 — every `.env.example` variable, traced

Legend — **In Vercel**: ✅ set / ❌ absent, with the Vercel *type* (`sensitive` = cannot be
read back; `encrypted` = readable in dashboard; `plain` = public). Verdicts: **required**,
**optional**, **dead** (delete), **blocked** (external, leave alone).

### Required and present (the platform depends on these; they are set)

| Variable | Read by (file:line) | In Vercel | Verdict |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `supabase/server.ts:8`, `middleware.ts:6`, `client.ts:7`, `admin.ts:9`, `r2/client.ts:7` | ✅ plain | required |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `supabase/server.ts:9`, `middleware.ts:7`, `client.ts:8` | ✅ plain | required |
| `SUPABASE_SERVICE_ROLE_KEY` | `supabase/admin.ts:10`, `r2/client.ts:8`, `signup/actions.ts:12` | ✅ encrypted | required · mark Sensitive (A4) |
| `DATABASE_URL` | `db/index.ts:12` | ✅ encrypted | required · mark Sensitive (A4) |
| `ANTHROPIC_API_KEY` | `agents/base-agent.ts:123`, `api/ai-ustaz:31`, `api/blog/generate:64`, `inngest/generate-blog:44` | ✅ sensitive (prod+preview, **not** dev) | required for AI |
| `GROQ_API_KEY` | `audio/transcribe.ts:10` | ✅ encrypted | required for tajweed · Sensitive (A4) |
| `RESEND_API_KEY` | `email/tracked-send:73`, `alerts.ts:83/107/239`, `notify-admin:18`, `parent-alert:31` | ✅ sensitive | required for email |
| `NEXT_PUBLIC_SITE_URL` | `next.config.ts:88` (build guard, throws), `site-config.ts:11` | ✅ encrypted | required — **build fails without it** |
| `CRON_SECRET` | `cron-auth.ts:19`, `agents/orchestrate:11` | ✅ encrypted | required · mark Sensitive (A4) |
| `ADMIN_SECRET` | `cron-auth.ts:20`, `orchestrate:12`, `admin/dars/[slug]/regenerate-poster:47` | ✅ sensitive | required |
| `MAIL_FROM_ADDRESS` | `site-config.ts:57` (falls back to a default) | ✅ sensitive (all envs) | required for alert deliverability |

### Optional and present (feature works / degrades cleanly)

| Variable | Read by | In Vercel | If absent | Verdict |
|---|---|---|---|---|
| `SUPPORT_EMAIL` | `site-config.ts:30` | ✅ encrypted | falls back to `academytibyaan@gmail.com` | optional (has fallback) |
| `ADMIN_WHATSAPP` | `site-config.ts:86` | ✅ sensitive | falls back to `+923129114002` | optional (has fallback) |
| `NEXT_PUBLIC_GA_ID` | `app/layout.tsx:115` | ✅ encrypted | analytics simply off | optional |
| `POSTER_ARABIC_ENABLED` | `og/poster.tsx:30` | ✅ plain (**preview only** — correct, A6) | Arabic poster text off | optional flag |
| `RECORDINGS_CLEANUP_ENABLED` | `api/recordings/cleanup:28` | ✅ sensitive (prod) | cron stays paused | optional — **Phase 13 removes this** |

### Documented, read by code, but ABSENT from Vercel (a feature is silently off)

| Variable | Read by | If absent (proven/▲inferred) | Verdict |
|---|---|---|---|
| `RESEND_WEBHOOK_SECRET` | `api/webhooks/resend:22` | route returns **503**, records no delivery/bounce (lines 22–29) | **set now (A2)** |
| `INNGEST_SIGNING_KEY` | Inngest SDK (`serve()`, no key passed) | `/api/inngest` **500s** (probed) → endpoint dead | set, **or** decide jobs stay off |
| `INNGEST_EVENT_KEY` | Inngest SDK (`inngest.send()`) | `inngest.send()` cannot authenticate in prod ▲ | set with the above |
| `SENTRY_DSN` | `instrumentation.ts:4,6` (`enabled: !!dsn`) | server error tracking **off** | optional — set if wanted |
| `NEXT_PUBLIC_SENTRY_DSN` | `instrumentation-client.ts:4,8` | client error tracking **off** | optional — set if wanted |
| `NEXT_PUBLIC_HERO_VIDEO_URL` | `components/homepage/hero-section.tsx:16` | hero shows brand panel (by design) | optional |
| `WHATSAPP_API_KEY` | `inngest/automation-workflows.ts:143` | that WhatsApp send skips; and the path is on the dead Inngest endpoint anyway | **mismatch — see note** |

> **WhatsApp name mismatch.** The only code that reads `WHATSAPP_API_KEY` is the (dead)
> Inngest automation path. The *live* WhatsApp sender `whatsapp/send-message.ts:13-14` reads
> **`WHATSAPP_ACCESS_TOKEN`** and **`WHATSAPP_PHONE_NUMBER_ID`** — which `.env.example` does
> not document at all. So `.env.example` names a variable the real sender never reads. This
> wants consolidating, not a blind delete.

### Documented but read by NO code — dead config

| Variable | Grep result | Verdict |
|---|---|---|
| `GEMINI_API_KEY` | only in `.env.example` | **delete from `.env.example`** |
| `GOOGLE_SEARCH_CONSOLE_API_KEY` | only in `.env.example` | **delete** |
| `GOOGLE_INDEXING_API_KEY` | only in `.env.example` | **delete** |
| `ADMIN_EMAIL` | `process.env.ADMIN_EMAIL` read nowhere; `site-config.ts:85` does `ADMIN_EMAIL = SUPPORT_EMAIL` (a constant, not the env var) | **delete** — and it is needlessly **set in Vercel**, where it is ignored |

### The Stripe three — absent, and correctly left absent

`STRIPE_SECRET_KEY` (`stripe/index.ts:9`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (read by **no
runtime code** — only the dead `env.ts` schema), `STRIPE_WEBHOOK_SECRET` (`api/webhooks/stripe:22`).
All ❌ absent. Stripe does not operate in Pakistan; these are a payments decision, not a
missing-key problem. **Leave alone**, as the brief says. `getStripe()` throws only if a payments
route is hit, which nothing in normal use does.

### Used by code, but NEVER documented in `.env.example` (the "lying the other way" set)

| Variable | Read by | In Vercel | Note |
|---|---|---|---|
| `DIRECT_URL` | `drizzle.config.ts:11`, `scripts/*.mjs` (7 scripts) | ✅ encrypted | **add to `.env.example`** · Sensitive (A4) |
| `WHATSAPP_ACCESS_TOKEN` | `whatsapp/send-message.ts:13` | ❌ | the real WhatsApp sender; document it |
| `WHATSAPP_PHONE_NUMBER_ID` | `whatsapp/send-message.ts:14` | ❌ | document with the above |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_WHATSAPP_FROM` | `api/parent-alert:69-71` | ❌ | parent-alert Twilio branch is off; document or remove |
| `DARS_CIRCLE_REMINDERS_ENABLED` | `api/dars-circles/reminders:21` | ❌ | flag defaults off → reminders cron disabled |
| `PARENT_REPORTS_ENABLED` | `api/parent-reports/weekly:22` | ❌ | flag defaults off → weekly parent reports disabled |

(`OPENAI_API_KEY` appears only in the dead `env.ts` schema; transcription uses Groq. Ignore.)

---

## Task 2 — Inngest: are the keys injected by the Vercel integration?

**No.** Evidence, not assumption:
- `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` are **not** in the Vercel env list (names
  pulled above). The Vercel–Inngest integration, when active, publishes exactly these two as
  normal project env vars — they would appear here. They don't.
- `src/lib/inngest.ts:3` creates the client with `{ id: "tibyaan-academy" }` only; `api/inngest/route.ts:13` calls `serve({ client, functions })` with **no `signingKey`**. So the SDK falls back to the env vars, which are absent.
- **Live probe:** `GET /api/inngest` on production → **HTTP 500 `internal_server_error`**.

**Conclusion:** the integration is not injecting anything and the endpoint cannot initialise.
All seven Inngest functions are dead in production. *Not determined:* the exact internal throw
(Vercel runtime function logs would show it) — but the 500 plus the absent signing key is
sufficient to call the endpoint non-functional.

---

## Task 3 — `RESEND_WEBHOOK_SECRET` / the Resend webhook

**The claim is TRUE, confirmed from the code.** `api/webhooks/resend/route.ts:22-29`:

```ts
const secret = process.env.RESEND_WEBHOOK_SECRET;
if (!secret) {
  console.error("[resend-webhook] RESEND_WEBHOOK_SECRET not set — rejecting webhook");
  return NextResponse.json({ error: "Not configured" }, { status: 503 });
}
```

With no secret the route **fails closed (503) before parsing anything**. Since the var is
absent from Vercel, every delivery/bounce/complaint event Resend sends is being rejected, so
`email_events` rows stay at `sent` forever and no bounce ever alerts. Phase 2's observability
is, today, recording the send and nothing after it. **Set `RESEND_WEBHOOK_SECRET` (A2)** and
the other half starts working.

---

## Task 4 — the login two-press bug (diagnosis only; fix is 12b)

**Symptom (given):** first press of Login/Signup does nothing visible; second press signs in.
Affects email sign-in and signup.

**What the code does.** Both auth flows are: a client handler → `await` a server action → the
server action does the Supabase auth call, which writes the session cookie through the SSR
adapter, then calls `redirect()` to a guarded route. Neither side revalidates the router cache.

- `login/page.tsx:32-41` — `handleEmailLogin` calls `await loginWithEmail(formData)` and only
  sets an error on failure. No `router.refresh()`.
- `login/actions.ts:17-60` — `signInWithPassword` (cookie written via `supabase/server.ts:15-24`
  `setAll`), then `redirect(dashboardPath)` at line 60. **No `revalidatePath('/', 'layout')`.**
- `signup/actions.ts:44-109` — identical shape: `signUp`, then `redirect(...)` at 105/108, no
  revalidation. This is why the symptom is the same on signup.
- `proxy.ts:63-82` guards the destination: `updateSession` (`supabase/middleware.ts:23-25`)
  calls `getUser()`; `if (!user && isProtectedRoute)` bounces back to login. So a first
  navigation that doesn't carry the fresh session lands the user **back on login** — exactly
  "nothing visible happened".

**The cause.** Of the three usual suspects, this is **#2 — the client router/layout cache is
never revalidated after auth**, which then presents as **#3 — the guarded navigation is served
without the new session**. Suspect **#1 is ruled out**: the cookie *is* written before the
redirect (`server.ts` `setAll` runs inside the action, before line 60's `redirect`). The
Supabase App-Router pattern requires `revalidatePath('/', 'layout')` (or a client
`router.refresh()`) between the auth call and the redirect precisely to discard the
pre-login cached layout; both are missing here. The second press works because the first
press's cookie is now stored, so the second navigation carries a valid session.

**Proof boundary (rule: mark what I could not determine).** The code evidence above is
conclusive about *what is missing*. I did **not** capture a live network trace of the redirect
request's `Cookie` header, because this read-only phase cannot boot the app (no env may be
written or pulled) and I have no test credentials to drive a real production login. **Not
determined by live trace;** it would be confirmed in 12b on the preview by watching one press
succeed after adding the revalidation. I am calling the cause *identified with code evidence*,
not *trace-proven* — the honest distinction the phase asks for.

**Likely fix (for 12b, not now):** add `revalidatePath('/', 'layout')` before each `redirect()`
in the two auth actions — within the "two files" ceiling the phase sets.

---

## Set this now (and why)

1. **`RESEND_WEBHOOK_SECRET`** (A2) — restores Phase 2 delivery/bounce recording; today the
   webhook 503s everything. Highest value, lowest effort, confirmed from code.
2. **`INNGEST_SIGNING_KEY` + `INNGEST_EVENT_KEY`** — *decision needed.* Set them (install the
   Inngest integration) to revive blog generation and the four automation workflows + SEO
   report, **or** we agree the jobs stay off and stop pretending the endpoint works. Right now
   it 500s silently.
3. **`DIRECT_URL`** — already set in Vercel; only missing from `.env.example`. Add it so the
   next person can run migrations.
4. *(Optional)* **`SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`** — error tracking is currently off in
   production. Set if you want Sentry; otherwise leave and we note it's off by choice.

## Delete from `.env.example` (and why)

1. **`GEMINI_API_KEY`** — read by no code.
2. **`GOOGLE_SEARCH_CONSOLE_API_KEY`** — read by no code.
3. **`GOOGLE_INDEXING_API_KEY`** — read by no code.
4. **`ADMIN_EMAIL`** — read by no code (the live constant is `SUPPORT_EMAIL`); also pointlessly
   set in Vercel, where it is ignored. Worth removing from Vercel too.
5. **`WHATSAPP_API_KEY`** — not a clean delete: replace it with the vars the real sender reads
   (`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`), and leave the dead Inngest reference
   to be cleaned when the Inngest decision is made.

## Also add to `.env.example` (the gap the other way)

`DIRECT_URL`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `DARS_CIRCLE_REMINDERS_ENABLED`,
`PARENT_REPORTS_ENABLED`, and the three `TWILIO_*` (or remove the Twilio branch if it's abandoned).

## Register additions (for `docs/silent-failure-sites.md`, to add when approved)

- **A validator that validates nothing** — `src/lib/env.ts` `getServerEnv()` is never called;
  its "required" checks never run.
- **An endpoint that reports healthy by building fine** — `/api/inngest` builds and deploys but
  500s at runtime; "deployed" was not "working".

---

*Phase 12 is read-only and ends here. No fix applied. Awaiting your word on what to fix (12b)
and on the Inngest decision.*
