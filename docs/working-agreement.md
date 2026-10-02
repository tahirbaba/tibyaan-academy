# Working agreement

How work is done on this repository. This is not aspirational — it is how the
project has actually been run, written down so it survives a lost session, a
closed editor, or a new person. If you are an AI or a human picking up this
codebase, read this first, and `docs/silent-failure-sites.md` second.

The platform is live, with real students in the UK, US, Canada and Australia.
Every rule here exists because breaking it has cost, or nearly cost, something
real.

## The rules

1. **Diagnose before fixing.** Find the actual cause and show it — from logs,
   from the database, from a reproduction — before changing code. A confident
   explanation is not a verified one; verify against the source, not against a
   story that fits. State a hypothesis as a hypothesis until the evidence makes
   it a fact.

2. **Plan the steps, then wait.** Before writing code for a phase or a
   substantial change, list the planned steps and wait for a go-ahead. Do not
   expand the job beyond what was asked.

3. **Nothing reaches `main` or production without explicit approval.** Work on a
   branch. Build a preview. Hand over the link. The owner approves each deploy
   on its own — approval of one thing is never approval of the next.

4. **One concern per commit**, with a message that explains the *why*, not just
   the what.

5. **Migrations run only alongside a deploy, after a verified backup.** Write
   the migration idempotently, prove it on a Neon branch cloned from real data
   (run it twice; the second run must change nothing), take a fresh backup and
   restore-check it, and only then run it against production — with the deploy,
   never on its own. A schema change and its migration ship together: see
   `docs/schema-and-migrations.md`.

6. **Stop and say when something is larger than it looks.** A task that turns
   out to touch more than it appeared to is a reason to stop and report, not to
   quietly do more.

7. **Report your own mistakes rather than quietly correcting them.** If you
   deployed from a conflicted tree, blanked a secret, trusted a check that
   proved nothing, or shipped a bug — say so, plainly, with what it cost and
   what you did about it. A quiet fix robs the owner of the chance to judge the
   damage. Knowing a risk is not the same as avoiding it; when the gap shows,
   name it.

8. **A control or a check must do what it appears to do.** A button that sets a
   flag nothing enforces, a probe that returns the same answer for "fine" and
   "broken", a catch that turns a failure into an empty page, a success response
   carrying a warning no one reads — these are the house's recurring failure, and
   they are catalogued in `docs/silent-failure-sites.md`. Do not add to it.
   Silence must mean "fine", never "we have no idea".

## Where the memory lives

- `docs/phase-20-work-order.md` — the brief the phases are measured against.
- `docs/silent-failure-sites.md` — the running register of code that reports
  success while producing nothing. The most-consulted file in the repo.
- `docs/schema-and-migrations.md` — why a schema change and its migration are
  one act.
- `docs/running-locally-safely.md` — how to run the app without touching
  production data.
- `docs/phase-7-8-database-checks.md`, the `migration-*.sql` files — the
  database procedures, each verified and dated.

Keep writing things down. Nothing important should depend on one machine or one
conversation surviving.
