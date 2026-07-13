# Setting up a staging environment

CI (`.github/workflows/ci.yml`) catches "is this broken" - bad migrations,
type errors, failing tests. It does **not** catch "does this actually work
end-to-end against real infrastructure" - that needs a staging environment.
This is a step-by-step to wire one up. It needs your Vercel/Neon dashboard
access, so I can't do it directly - each step below is a manual action.

## Why this matters

Every incident in [INCIDENTS.md](INCIDENTS.md) reached production before
anyone noticed. A staging environment means a push gets tested against a
real (but isolated) database and a real (but non-production) URL first.

## Steps

1. **Enable Neon database branching.** In the Vercel dashboard → your
   project → Storage → your Neon database → look for "branching" or go to
   the Neon console directly (Storage tab → "Open in Neon Console"). Neon
   can auto-create a fresh branch (a full copy of your schema, cheap and
   fast) for every Vercel Preview deployment.

2. **Connect Neon's Vercel integration to auto-branch on Preview
   deployments.** If you used the Vercel-Neon integration when you first
   set this up, there's a setting for "Create database branch for
   deployment" per environment (you may recall seeing this checkbox during
   initial setup, unchecked at the time). Turn it on for **Preview**
   specifically - leave Production alone, since Production should keep
   using the one real database.

3. **Confirm Vercel Preview deployments happen automatically.** By
   default, Vercel creates a Preview deployment for every git push that
   isn't to `main` (i.e., every branch/PR gets its own preview URL). Check
   Vercel → Settings → Git to confirm this is on.

4. **Workflow going forward:** push to a feature branch instead of
   directly to `main`/`Tobi-Williams` → Vercel builds a Preview deployment
   against its own Neon branch (migrations run against *that* branch, not
   production) → click through the preview URL and manually test the
   change → only merge to the production branch once it's confirmed
   working there.

5. **Optional but recommended:** once a Preview deployment exists, do a
   quick manual smoke test on it before merging - sign in, submit weekly
   input, check a draft generates. This is the "test under real
   conditions" step CI can't do on its own (CI never actually calls
   OpenRouter/Resend/Blob with real credentials).

## What this doesn't replace

CI still runs on every push regardless - it's the fast, cheap check.
Staging is the slower, more realistic check before something goes live.
Both matter; neither substitutes for the other.
