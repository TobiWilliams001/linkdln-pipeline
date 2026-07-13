# Incident Log

Blameless postmortems. The question is never "who forgot to do X" — it's
"what about our system allowed X to be forgettable," and what changed so
the same *class* of failure can't recur.

---

## 2026-07-05 — Vercel build failing on every deploy

**Symptom:** `Module not found: Can't resolve '@/generated/prisma/client'` on every Vercel build.

**Root cause:** `src/generated/prisma` (the generated Prisma client) is gitignored, so it never reached GitHub. Locally it worked because `prisma generate` had been run by hand at some point; Vercel's build never ran it.

**Systemic fix:** `build` script now runs `prisma generate` before `next build` — the client is regenerated fresh on every build, so it can never be silently missing again.

---

## 2026-07-11 — Sign-in broken (`AccessDenied` / `P2022: column does not exist`)

**Symptom:** Sign-in and dashboard pages crashed with a database error after a schema change (added `checkInFrequency` to `Client`).

**Root cause:** The migration existed in the repo but was never run against the production (Neon) database. Nothing enforced that a schema change and its migration reach production together.

**Systemic fix (partial, superseded below):** Manually ran `prisma migrate deploy`. This was a stopgap, not a fix — the same failure mode recurred four days later.

---

## 2026-07-12 — Same failure again (`ContentPost.impressions does not exist`)

**Symptom:** Identical failure mode to the 07-11 incident, this time for newly added performance-tracking columns.

**Root cause:** Confirms the 07-11 fix wasn't systemic — a manually-remembered step will eventually be forgotten again. The actual root cause was "there is no enforcement that migrations reach production," not "someone forgot a command."

**Systemic fix:** `build` script now runs `prisma migrate deploy` *before* `prisma generate`, so every deploy applies pending migrations automatically. A missed migration is no longer possible - see [CI](.github/workflows/ci.yml) below for the second half of this fix.

---

## 2026-07-13 — First-time sign-in broken for any brand-new email (`AccessDenied` / `P2025`)

**Symptom:** Every new email attempting to sign in for the first time failed. Already-provisioned accounts were unaffected, which delayed noticing this broke signup entirely.

**Root cause:** The `signIn` callback tried to `db.user.update()` a `clientId` onto the new user's row - but for a brand-new email, Auth.js only persists that row *after* the callback returns `true`. The callback was running against a row that didn't exist yet.

**Systemic fix:** Moved the client-provisioning logic to the `createUser` event, which fires only after the row is actually persisted. Root-caused by tracing Auth.js's actual internal call order rather than guessing at the fix.

---

## Process gap identified across all four incidents

Every one of these reached production before being caught, because there was no environment between "local" and "live users" where a broken migration, a missing env var, or a bad build could surface safely. Added:

- **CI** (`.github/workflows/ci.yml`) — runs on every push/PR: verifies `schema.prisma` and `prisma/migrations` haven't drifted apart, applies every migration to a brand-new database, type-checks, lints, tests, and does a full production build. All of the incidents above would have been caught here before merge.
- **Still open:** a real staging environment (Neon database branch + Vercel preview deployment) so a push can be smoke-tested against production-like infrastructure before it's actually live. CI catches "is this broken," staging would catch "does this actually work end-to-end" - the two are complementary, and only the first exists so far.
