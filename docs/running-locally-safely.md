# Running the site on your own machine, safely

For testing `phase-20` without Vercel, and **without touching production data**.

Follow this in order. Nothing here writes to production if you complete Step 2
before Step 5. There is a check at Step 6 that proves which database you are
pointed at **before** you open the site.

---

## First, a correction

I previously said "`.env.local` in this repo points at the production
database." **That was wrong, and I should have checked before saying it.**
There is no `.env.local` on this machine at all — the project has only
`.env.example`, which is a template full of placeholders.

The danger is still real, but it is a danger you would *create* rather than one
already sitting there: the obvious way to get the app running is to copy the
values out of Vercel, and those point at production. Step 2 exists so you do
not do that.

---

## What you are protecting against

The app does not treat "local" as special. If it is pointed at the production
database, then running it locally and clicking **Approve** on a dars **really
publishes that dars** to the live site. Same for deleting a user, changing a
course, or approving a video. There is no "local mode" that stops it.

So: give it a copy of the database instead. A Neon **branch** is a full copy of
production data that is isolated from it — writes to the branch never reach
production — and it costs nothing.

---

## Step 1 — Check you have Node.js

Open **PowerShell** (press Start, type `powershell`, press Enter) and run:

```powershell
node --version
```

You should see something like `v20.x` or `v24.x`. If you see an error, install
Node.js LTS from https://nodejs.org first, then close and reopen PowerShell.

---

## Step 2 — Make a Neon branch to use as your local database

In your browser:

1. Go to https://console.neon.tech and open the **tibyaan** project.
2. Click **Branches** in the left sidebar.
3. Click **Create branch**.
4. Parent branch: your **production** branch (usually called `main`).
5. Name it exactly: **`local-dev`**
6. Click **Create**.

Now get its connection string:

7. Still on the `local-dev` branch, click **Connect** (or **Connection
   Details**).
8. **Make sure the branch selector at the top says `local-dev`, not `main`.**
   This is the step that matters most on this page.
9. Copy the connection string. It looks like:
   `postgresql://USER:PASSWORD@ep-something-12345.us-east-1.aws.neon.tech/neondb?sslmode=require`

Keep that tab open — you will paste this in Step 4.

> The host contains a code unique to the branch (the `ep-...` part). Production
> and `local-dev` have **different** `ep-...` codes. That difference is what
> Step 6 checks.

---

## Step 3 — Get on the right code

In PowerShell:

```powershell
cd "C:\Users\FARAZ TRADERS\Desktop\Tibyaan_Academy\tibyaan-academy"
git checkout phase-20
git pull
npm install
```

`npm install` may take a few minutes the first time. Warnings are normal;
errors in red that stop it are not.

---

## Step 4 — Create your local settings file

In PowerShell, from the same folder:

```powershell
notepad .env.local
```

Notepad will say the file does not exist and offer to create it — say **Yes**.

Paste this in, then replace the two marked lines:

```
# The Neon BRANCH connection string from Step 2 — NOT production.
DATABASE_URL=paste-the-local-dev-connection-string-here

NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase — copy these three from Vercel (Settings -> Environment Variables).
# These are for login only and are safe to share with local: the destructive
# actions all go through DATABASE_URL, which is now your branch.
NEXT_PUBLIC_SUPABASE_URL=copy-from-vercel
NEXT_PUBLIC_SUPABASE_ANON_KEY=copy-from-vercel
SUPABASE_SERVICE_ROLE_KEY=copy-from-vercel

# Turn the Arabic on so you can see it. Local only.
POSTER_ARABIC_ENABLED=true

# Left deliberately empty. Email, payments and AI are simply inert locally,
# which is what you want — no mail can be sent to a real student by accident.
RESEND_API_KEY=
STRIPE_SECRET_KEY=
ANTHROPIC_API_KEY=
SUPPORT_EMAIL=you@example.com
```

Save (**Ctrl+S**) and close Notepad.

To find the Supabase values: Vercel → your project → **Settings** →
**Environment Variables** → click the eye icon next to each name.

> `.env.local` is already in `.gitignore`, so it can never be committed.

---

## Step 5 — Apply the pending migrations to YOUR branch

Your branch is a copy of production, so it is missing the three new columns —
the same reason the preview's dars pages error. Apply them to the branch only.

In the Neon console, with **`local-dev` selected**, open **SQL Editor** and run
the contents of these three files, one at a time, in this order:

1. `docs/migration-phase7-assignments.sql`
2. `docs/migration-phase8-poster.sql`
3. `docs/migration-phase7b-drop-student-assignments.sql`

Open each in Notepad to copy from:

```powershell
notepad docs\migration-phase7-assignments.sql
```

> Double-check the branch selector says **`local-dev`** before you press Run.
> These are safe and reversible on a branch; on production they wait for the
> deploy.

---

## Step 6 — Prove you are pointed at the branch, before opening anything

**Do this before Step 7.** In PowerShell:

```powershell
node scripts\check-which-database.mjs
```

It prints the host your `.env.local` points at and tells you plainly whether it
is your branch or production. It reads only — it cannot change anything.

- **"SAFE"** — carry on.
- **"STOP — this is production"** — go back to Step 2 step 8; you copied the
  connection string with the wrong branch selected.

---

## Step 7 — Start the site

```powershell
npm run dev
```

Wait for `Ready`, then open **http://localhost:3000/en** in your browser.

To stop it: click on the PowerShell window and press **Ctrl+C**.

What to look at:

- `http://localhost:3000/en/dars` — the list, with posters
- `http://localhost:3000/en/dars/2026-04-29-dua-entering-masjid-2024` — a dars
  page with the poster at the top
- `http://localhost:3000/api/og/dars/2026-04-29-dua-entering-masjid-2024` — the
  bare poster image, which is what a phone share preview shows
- `http://localhost:3000/en/teacher/tests-assignments` — Phase 7 (log in first)

To see it on your **phone**, both devices on the same wi-fi:

```powershell
npm run dev -- --hostname 0.0.0.0
```

PowerShell will print a `Network:` address like `http://192.168.1.42:3000`.
Open that on the phone. If it does not load, Windows Firewall is blocking it —
allow Node.js when prompted, or skip it and view the poster image on the
desktop instead.

---

## When you are finished

```powershell
# in the PowerShell window running the site
Ctrl+C
```

Delete the `local-dev` branch in the Neon console when you no longer need it
(Branches → `local-dev` → Delete). Your `.env.local` can stay — it points at
the branch, so it is inert once the branch is gone, and it is never committed.

---

## If something goes wrong

**"column poster_url does not exist"** — Step 5 was skipped, or was run on the
wrong branch.

**Port 3000 already in use** — something else is running. Close other terminal
windows, or run `npm run dev -- --port 3001` and use `localhost:3001`.

**Login does not work** — the three Supabase values in Step 4 are missing or
mistyped. Note that your login account lives in Supabase, not in the Neon
branch, so it is the same account as production.

**The site loads but every page errors** — check the PowerShell window; the
real error is printed there.
