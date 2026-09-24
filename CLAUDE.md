# Tibyaan Academy — Project Guide

@AGENTS.md

## Overview

**Tibyaan Academy** is a modern digital Madrasah (Islamic school) for Quran & Islamic Sciences.
Live URL: `https://tibyaanacademy.com` | Vercel region: `iad1` (US East)

**Core value proposition**: Live 1-on-1 teachers + AI Ustaz (tutor), affordable plans from $25/month, 5 languages, gamified learning for kids.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16.2.1** (App Router, React 19, React Compiler) |
| Language | **TypeScript 5** (strict mode, `@/*` path alias = `./src/*`) |
| Styling | **Tailwind CSS v4** + shadcn/ui (Base UI) + Framer Motion |
| Database | **Neon Serverless PostgreSQL** via Drizzle ORM (`@neondatabase/serverless` HTTP driver) |
| Auth | **Supabase Auth** (`@supabase/ssr` + `@supabase/supabase-js`) |
| Payments | **Stripe** (subscriptions, checkout, webhooks) |
| AI | **Anthropic Claude** (Sonnet 4.5 for agents) + **OpenAI Whisper** (audio transcription) |
| Email | **Resend** |
| Storage | **Cloudflare R2** (S3-compatible, for videos & recordings) |
| WhatsApp | **Meta WhatsApp Business API** (parent reports) |
| Monitoring | **Sentry** (error tracking) + **Vercel Analytics/Speed Insights** |
| i18n | **next-intl v4** (5 locales: ur, ar, en, fr, id) |
| PWA | Service worker + manifest.json |

## Key Commands

```bash
npm run dev          # Dev server (with IPv6 fix for WSL2)
npm run build        # Production build
npm run db:generate  # Generate Drizzle migrations
npm run db:migrate   # Run Drizzle migrations
npm run db:push      # Push schema directly (no migration files)
npm run db:studio    # Open Drizzle Studio GUI
```

All commands use `NODE_OPTIONS='--require ./fix-ipv6.cjs'` for WSL2 IPv6 compatibility.

## Environment Variables

Defined in `.env.local` (see `.env.example`):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase admin |
| `DATABASE_URL` | Neon PostgreSQL (HTTP, used by app) |
| `DIRECT_URL` | Neon PostgreSQL (direct, used by Drizzle migrations) |
| `ANTHROPIC_API_KEY` | Claude AI |
| `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe |
| `RESEND_API_KEY` | Transactional email |
| `CRON_SECRET` / `ADMIN_SECRET` | Cron job & admin API auth |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error tracking |
| `NEXT_PUBLIC_SITE_URL` | Canonical public base URL (metadata, canonicals, sitemap, robots, share links) |
| `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` | WhatsApp API |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout (fonts, SEO, JSON-LD)
│   ├── globals.css                   # Tailwind v4 + Islamic color theme
│   ├── global-error.tsx              # Sentry error boundary
│   ├── robots.ts                     # robots.txt (blocks /student/, /teacher/, /admin/, /api/)
│   ├── sitemap.ts                    # Dynamic sitemap (locales x pages + blog posts from DB)
│   ├── api/                          # ~60 API routes (see API section below)
│   └── [locale]/                     # i18n-wrapped routes
│       ├── layout.tsx                # Locale layout (ThemeProvider, Analytics, PWA)
│       ├── (public)/                 # Public pages (homepage, courses, pricing, blog, etc.)
│       ├── (auth)/                   # Auth pages (login, signup, onboarding, callback)
│       ├── student/                  # Student dashboard (protected)
│       ├── teacher/                  # Teacher dashboard (protected, role-checked)
│       └── admin/                    # Admin panel (protected, role-checked, client layout)
├── components/
│   ├── ui/                           # shadcn/ui base components (button, card, input, etc.)
│   ├── homepage/                     # Landing page sections (hero, features, pricing teaser, etc.)
│   ├── blog/                         # Blog card + content renderer
│   ├── chat/                         # Real-time messaging (ChatWindow)
│   ├── courses/                      # Course listing & detail pages
│   ├── pricing/                      # Full pricing page
│   ├── kids-games/                   # 8 interactive Arabic learning games + reward system
│   ├── student/                      # Gamification widgets (XP, streaks, badges, leaderboard, progress map)
│   └── shared/                       # Navbar, Footer, NotificationBell, PWA prompt, reviews
├── hooks/
│   ├── use-user.ts                   # Supabase user state
│   ├── use-session.ts                # Supabase session state
│   ├── use-role.ts                   # User role (student/teacher/admin)
│   └── use-audio-recorder.ts         # MediaRecorder wrapper for audio capture
├── i18n/
│   ├── routing.ts                    # Locale config: ["ur","ar","en","fr","id"], default: "ur"
│   ├── request.ts                    # Server-side locale resolution
│   └── navigation.ts                 # Typed Link, redirect, usePathname, useRouter
├── lib/
│   ├── agents/                       # Multi-agent AI system (see Agents section)
│   ├── audio/transcribe.ts           # OpenAI Whisper Arabic transcription
│   ├── claude/                       # System prompts (blog.ts, ustaz.ts, teacher-assistant.ts)
│   ├── data/course-syllabus.ts       # Static syllabus data (Nazra, Hifz 30 juz, Arabic, Aalim)
│   ├── db/
│   │   ├── index.ts                  # getDb() singleton (Neon HTTP + Drizzle)
│   │   ├── schema.ts                 # 36 tables, 25+ enums (1445 lines)
│   │   ├── queries.ts                # Student queries
│   ��   ├── teacher-queries.ts        # Teacher dashboard queries
│   │   ├── gamification-queries.ts   # Points, streaks, badges, leaderboard
│   │   └── dars-circle-queries.ts    # Study group CRUD
│   ├── r2/client.ts                  # Cloudflare R2 (S3) presigned URLs, upload, delete
│   ├── scheduling/availability.ts    # Teacher/student schedule conflict detection
│   ├── stripe/index.ts               # Stripe checkout, subscriptions, pricing table
│   ├── supabase/
│   │   ├── client.ts                 # Browser Supabase client
│   │   ├── server.ts                 # Server Supabase client (cookies)
│   │   └── middleware.ts             # Session refresh middleware
│   ├── utils.ts                      # cn() classname utility
│   └── whatsapp/                     # WhatsApp message sending + weekly report generation
├── proxy.ts                          # Next.js middleware (i18n + auth + RBAC)
├── instrumentation.ts                # Sentry server init
└── instrumentation-client.ts         # Sentry client init
messages/                             # i18n JSON files (en.json, ur.json, ar.json, fr.json, id.json)
drizzle/                              # Migration files
```

## Middleware (`src/proxy.ts`)

Combines next-intl routing with Supabase auth:
- **Protected paths**: `/student`, `/teacher`, `/admin` — redirects unauthenticated to login
- **Auth paths**: `/login`, `/signup`, `/onboarding` — redirects authenticated to dashboard
- **RBAC**: Admin routes require `admin` role; teacher routes require `teacher` or `admin`
- Matcher: `["/", "/(ur|ar|en|fr|id)/:path*"]`

## Database Schema (36 tables)

Schema file: `src/lib/db/schema.ts` | Config: `drizzle.config.ts` | Migrations: `drizzle/`

### Core Entities
- **users** — id (uuid), email, full_name, avatar_url, role (student/teacher/admin), preferred_language, timestamps
- **student_profiles** — age, country, phone, parent info (name/phone/whatsapp), plan_type, classes_per_week
- **teacher_profiles** — bio, specializations[], languages[], hourly_rate, is_verified, intro_video_url, availability (jsonb)
- **courses** — slug, multilingual names/descriptions (5 langs), course_type (nazra/hifz/arabic/aalim), pricing
- **enrollments** — student_id, course_id, plan_type (human_ai/pure_ai), status (trial/active/paused/cancelled), trial dates, stripe_subscription_id

### Learning & Assessment
- **classes** — enrollment_id, teacher_id, scheduled_at, duration_minutes (default 30), status, meeting_link
- **lessons** — enrollment_id, lesson_number, multilingual titles, content (jsonb), lesson_type, completion status
- **hifz_tracker** — student_id, surah_number, ayah_from/to, type (sabaq/sabqi/manzil), status, score, ai_feedback
- **weekly_tests** — enrollment_id, week_number, scores, ai_feedback, teacher_feedback
- **tajweed_checks** — student_id, audio_url, transcription, surah/ayah, score, errors/strengths/suggestions (jsonb)
- **kids_activities** — student_id, activity_type (8 game types), level, score, time, mistakes, haroof_practiced[]

### Gamification
- **student_points** — student_id, action (10 types), points, description, timestamps
- **student_streaks** — student_id, current_streak, longest_streak, last_activity_date
- **student_badges** — student_id, badge_type (17 types), earned_at
- **leaderboard** — student_id, total_points, level, opted_in

### Communication
- **teacher_student_matches** — student_id, teacher_id, course_id, status (requested/accepted/rejected/active/completed), scores
- **messages** — match_id, sender_id, content, type (text/system), is_read
- **notifications** — user_id, type (15 types), title, message, is_read, link
- **class_recordings** — match_id, teacher_id, student_id, r2_key, expires_at, is_deleted

### Content
- **blog_posts** — slug, multilingual titles/content (5 langs), meta_description, keywords[], is_published, ai_generated
- **daily_dars** — category (quran/hadith/fiqh/seerah/dua), multilingual titles/content, source, ai_generated
- **teacher_videos** — teacher_id, title, r2_key, thumbnail_key, status (pending/approved/rejected)
- **reviews** — student_id, course_id, rating, review_text, is_video, is_approved, ai_moderated

### Subscriptions
- **subscriptions** — student_id, stripe_customer_id, stripe_subscription_id, plan_type, course_id, amount_usd, status (trialing/active/past_due/cancelled)
- **referrals** — referrer_id, referred_id, referral_code, reward_months

### Study Groups
- **dars_circles** — teacher_id, multilingual titles/descriptions, category, scheduled_at, duration_minutes, meeting_link, max_students, current_students, status
- **dars_circle_enrollments** — circle_id, student_id

### Admin & Scheduling
- **schedule_requests** — student_id, teacher_id, course_id, timezone, preferred_days/time, ai_suggestions, selected_slot, status
- **parent_reports** — student_id, report_data (jsonb), whatsapp_number, status, sent_at
- **agent_logs** — agent_name, task_type, status, input/output (jsonb), tokens_used, duration_ms
- **ai_usage_logs** — user_id, session_id, model, tokens_in/out, estimated_cost
- **admin_settings** — key (unique), value (jsonb)
- **aalim_course_categories** — course_id, category_name (2/4/6/8 year), pricing
- **ai_chat_history** — student AI Ustaz conversations
- **teacher_ai_chats** — teacher AI assistant conversations

## AI Agent System

Located in `src/lib/agents/`. An orchestrator routes tasks to 9 specialized agents:

| Agent | Tasks | Description |
|---|---|---|
| **content-agent** | generate_daily_dars, generate_blog, translate_content | Islamic content generation in 5 languages |
| **seo-agent** | optimize_seo, generate_meta | SEO optimization for Islamic education niche |
| **ustaz-agent** | chat_response | Interactive AI Quran tutor (4 course modules) |
| **moderation-agent** | moderate_video, moderate_content | AI content moderation (culturally aware) |
| **matching-agent** | score_match, suggest_teachers | Student-teacher compatibility scoring |
| **notification-agent** | send_notification, send_email, send_whatsapp | Multi-channel notifications |
| **tajweed-agent** | analyze_tajweed | Quran recitation analysis (15+ rules, 0-100 score) |
| **teacher-assistant-agent** | generate_lesson_plan, generate_quiz, analyze_student_progress | Teacher productivity tools |
| **scheduling-agent** | suggest_schedule | AI-powered class scheduling with timezone/prayer time awareness |

All agents extend `BaseAgent` which handles Claude API calls and logging to `agent_logs` table.

## API Routes (~60 endpoints)

### Payments
- `POST /api/payments/checkout` — Create Stripe checkout session
- `GET /api/payments/subscription` — Get user subscriptions
- `POST /api/payments/cancel` — Cancel/reactivate subscription
- `POST /api/payments/family-discount` — Apply family discount
- `POST /api/webhooks/stripe` — Stripe webhook handler

### AI Tutoring
- `POST /api/ai-ustaz` — Streaming AI chat (Claude, persisted)
- `GET /api/ai-ustaz/sessions` — List chat sessions
- `GET /api/ai-ustaz/sessions/[sessionId]` — Load session messages

### Teacher AI Assistant
- `POST /api/teacher-ai/chat` — Streaming teacher AI chat
- `POST /api/teacher-ai/generate-quiz` — Generate quiz questions
- `POST /api/teacher-ai/generate-lesson-plan` — Generate lesson plan
- `POST /api/teacher-ai/analyze-student` — AI student analysis

### Admin
- `GET /api/admin/analytics` — Dashboard analytics
- `GET/POST /api/admin/users` — User management
- `GET/PATCH /api/admin/users/[id]` — Single user management
- `GET/POST /api/admin/courses` — Course management
- `PATCH/DELETE /api/admin/courses/[id]` — Single course management
- `GET /api/admin/ai-monitor` — AI usage monitoring
- `GET/PATCH /api/admin/reviews` — Review moderation
- `POST /api/admin/reviews/spam-check` — AI spam detection

### Content (Cron Jobs)
- `GET /api/blog/generate` — Daily 6AM: AI blog generation (5 languages)
- `GET /api/dars/generate` — Daily 5AM: Daily dars generation (rotating categories)
- `GET /api/recordings/cleanup` — Daily midnight: Delete expired R2 recordings
- `GET /api/parent-reports/weekly` — Sunday 8AM: WhatsApp weekly reports
- `GET /api/dars-circles/reminders` — Hourly: Circle reminder notifications

### Student Features
- `POST /api/tajweed/check` — Audio upload + Whisper transcription + Claude analysis
- `GET /api/tajweed/history` — Tajweed check history
- `GET /api/gamification/stats` — XP, streaks, badges
- `GET /api/gamification/leaderboard` — Top 20 students
- `POST /api/gamification/opt-in` — Toggle leaderboard visibility
- `POST /api/referrals` — Generate referral code

### Messaging & Matching
- `POST /api/matches` — Request teacher match
- `PATCH /api/matches/[id]/respond` — Accept/reject match
- `POST /api/messages` — Send message in match
- `GET /api/messages/[matchId]` — Load conversation

### Scheduling
- `POST /api/scheduling/request` — Student requests schedule
- `GET /api/scheduling/suggestions` — AI-generated time slots
- `POST /api/scheduling/confirm` — Confirm selected slot
- `POST /api/scheduling/[id]/respond` — Teacher confirms/rejects

### Dars Circles
- `GET/POST /api/dars-circles` — List/create study circles
- `GET/PATCH /api/dars-circles/[id]` — Circle details/update
- `POST /api/dars-circles/[id]/join` — Join circle
- `POST /api/dars-circles/[id]/leave` — Leave circle

### Media
- `POST /api/videos/upload` — Teacher video upload (presigned URL)
- `PATCH /api/videos/[id]/approve` — Admin approve/reject video
- `POST /api/recordings/upload` — Class recording upload (presigned URL, 7-day expiry)

## i18n / Localization

- **Locales**: ur (Urdu, default), ar (Arabic), en (English), fr (French), id (Indonesian)
- **RTL support**: ur and ar get `dir="rtl"` on `<html>`
- **Message files**: `messages/{locale}.json` (~50-60KB each)
- **Navigation**: Use `@/i18n/navigation` for `Link`, `redirect`, `usePathname`, `useRouter`
- **Server**: Use `getLocale()` from `next-intl/server`
- **Client**: Use `useTranslations("namespace")` from `next-intl`

## Theming

Islamic brand colors (defined in `globals.css`):
- **Primary**: Deep Green `#1B4332` (Islamic green)
- **Accent**: Gold `#C9A84C` (Islamic gold)
- **Dark mode**: Full dark theme with adjusted contrasts
- Uses `next-themes` ThemeProvider with `class` attribute strategy

Custom CSS variables: `--color-islamic-green`, `--color-islamic-gold` + light/dark variants.

## Pricing Structure

| Course | Plan 1 (Human+AI) | Plan 2 (AI-only) |
|---|---|---|
| Nazra Quran | $33/mo | $25/mo |
| Hifz Quran | $45/mo | $37/mo |
| Arabic | $43/mo | $35/mo |
| Aalim | $50/mo | $40/mo |

- **Yearly**: 10-month price (2 months free)
- **Family discount**: 2nd student 20% off, 3rd+ 30% off

## Coding Conventions

- **Next.js 16**: Read `node_modules/next/dist/docs/` before using new APIs. `params` is a Promise in layouts/pages.
- **Components**: `"use client"` for interactive components. Server components by default.
- **Imports**: Use `@/` alias. Use `@/i18n/navigation` for localized routing (never `next/link` directly).
- **Database**: Always use `getDb()` from `@/lib/db`. Schema in `src/lib/db/schema.ts`.
- **Schema changes ship with their migration — always.** Adding a column to
  `schema.ts` makes every query ask for it, so an unmigrated database rejects
  the *whole* query (`42703`) and every page using it fails. In Sept 2026 one
  nullable column took out every dars page in all five locales. Read
  `docs/schema-and-migrations.md` before touching `schema.ts`.
- **Avoid a bare `db.select()`** on a table whose schema may be ahead of the
  database — it requests every column in the schema, including one added
  minutes ago. Name the columns you need. It also stops you shipping a joined
  `users` row complete with somebody's email address.
- **A `catch` around a query must be louder, not quieter.** Alert and rethrow;
  never fall through to an empty list. A 500 gets reported, a clean empty page
  gets believed. See `docs/silent-failure-sites.md`.
- **Auth pattern**: Server — `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();`
- **API auth pattern**: Check `supabase.auth.getUser()`, return 401 if no user. Admin routes check `user.user_metadata?.role`.
- **Styling**: Use `cn()` from `@/lib/utils` for conditional classes. Islamic green/gold palette.
- **Forms**: react-hook-form + zod validation
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Icons**: lucide-react exclusively

## Courses

4 course types with distinct features:
1. **Nazra Quran** — Basic Quran reading with Tajweed (slug: `nazra-quran`)
2. **Hifz Quran** — Quran memorization with sabaq/sabqi/manzil tracking (slug: `hifz-quran`)
3. **Arabic Language** — Modern Standard Arabic (slug: `arabic-language`)
4. **Aalim Course** — Advanced Islamic scholarship, 2/4/6/8 year programs (slug: `aalim-course`)

## User Roles

- **student** (default): Dashboard, courses, AI Ustaz, gamification, activities, tajweed checker, messages, recordings, schedule, dars circles
- **teacher**: Dashboard, students, schedule, lessons, tests, certificates, revenue, videos, messages, recordings, AI assistant, dars circles
- **admin**: Dashboard, users, courses, videos, recordings, matches, agents, AI monitor, reviews, notifications, parent reports
