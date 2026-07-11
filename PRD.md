# LinkedIn Content Pipeline — Product Overview

**Status: Working prototype, core loop complete**
*Last updated: July 11, 2026*

---

## 1. What this is

A self-serve tool that turns someone's raw thoughts into ready-to-post LinkedIn content, on whatever schedule they choose, with almost no writing effort.

The core idea: instead of sitting down and "writing a LinkedIn post," a user answers a few quick prompts on a recurring basis (weekly, every two weeks, or monthly — their choice). The system combines their answers with a profile of how they actually talk and what they stand for, and produces a batch of ready-to-review draft posts written in their voice. They just review, tweak if needed, approve, and mark it posted.

---

## 2. Who uses it, and how

Anyone. Sign in with your email — that automatically creates your own workspace, no invite or gatekeeper required.

### First-time setup (one-time, self-serve)
The first time you sign in, you fill out your own profile:
- Your name or brand
- How you actually talk — either typed notes or an audio recording that gets automatically transcribed
- The core belief or philosophy that drives your content
- The real problem your ideal customer struggles with
- Your origin story
- A few of your best results (situation → outcome)
- Strong opinions you're willing to share
- How many posts per week you want, and how often you'll check in (weekly / every two weeks / monthly)

### The ongoing loop
- **Check-in (~10 min):** Four short prompts — something interesting that happened, a recent situation, a question worth asking publicly, and an industry observation. The first one can be answered by voice note instead of typing (it gets transcribed automatically).
- **Drafts inbox:** As soon as they submit a check-in, the system automatically generates a batch of draft posts. They review each one, can edit the wording, and approve it.
- **Mark as posted:** Once approved, they can mark a post as published and optionally paste the live LinkedIn link, so everything is tracked in one place.
- **Dashboard:** A simple monthly snapshot — how many posts were generated, how many approved, how many actually went live — plus a list of the month's posts and their status.

---

## 3. What's automated vs. manual today

| Step | Who/what does it |
|---|---|
| Profile setup (voice, beliefs, results) | User, self-serve, one-time (can edit anytime) |
| Reminder if a check-in is due and missed | **Automatic** — scheduled email, respects each user's chosen cadence |
| Turning check-in answers into draft posts | **Automatic** — kicks off the moment the user submits |
| Deciding what *kind* of posts to write (see below) | **Automatic** |
| Writing the actual post copy | **Automatic** (AI-generated, in the user's voice) |
| Reviewing, editing, approving | User, manual |
| Actually posting to LinkedIn | User, manual (we don't auto-publish) |

---

## 4. The "content mix"

Rather than generating the same type of post every time, the system rotates through six content styles: **Insight, Story, Process, Opinion, Result, and Observation.**

It leans toward variety — it avoids repeating a type that was used recently, leans a bit more on Observations and Insights (easy to generate consistently), and leans less on Results (since those depend on a limited supply of real success stories). How many posts get made each check-in is driven by the cadence chosen during setup.

Every draft is written using a style guide baked into the system: no marketing buzzwords, no bullet-point lists, concrete real examples, and posts end with a question rather than a sales pitch.

---

## 5. What's captured behind the scenes

In plain terms, the system keeps track of:
- **Clients** (workspaces) — profile, voice, beliefs, results, desired posting pace, and check-in frequency
- **Users** — login accounts, one per workspace today
- **Check-ins** — each period's answers, including any voice note
- **Posts** — each individual draft: its type, the AI-written text, any edits, whether it's approved, whether it's posted, and the live link once posted

---

## 6. Where things stand

All of the above is built and working end-to-end on the `main` branch:
- Open, self-serve sign-in — no invite step ✅
- Self-serve profile setup, including voice notes ✅
- Configurable check-in frequency (weekly / biweekly / monthly) ✅
- Drafts are auto-generated in a mixed variety of content types ✅
- Users can review, edit, approve, and mark posts as posted ✅
- Monthly progress dashboard ✅
- Automated reminder emails that respect each user's chosen cadence ✅

### Open items / things to sanity-check before wider rollout
- Resend's shared test sender (`onboarding@resend.dev`) only delivers to the account owner's own address — a verified sending domain is needed before invite/reminder emails can reach real users at scale.
- Worth confirming error handling for the voice-note transcription step — e.g., what a user sees if a recording fails to upload or transcribe.
- No admin/oversight view anymore — there's no way to see all workspaces at a glance if that's ever needed again.
- No auto-publish to LinkedIn — posting itself is still a manual, user-side step.
- Each workspace supports exactly one login today; no "invite a teammate to the same workspace" flow (existed briefly as an admin feature, removed with the admin section).

---

## 7. Suggested next conversations with the team

1. Now that sign-up is fully open, do we want any moderation/oversight view at all, or is per-user self-serve the whole model?
2. Should we auto-publish to LinkedIn eventually, or is manual posting a deliberate choice (e.g., for compliance/review reasons)?
3. What's our fallback plan if voice transcription fails — silent retry, error message, or manual fallback?
4. Do we want multi-user workspaces (teammates sharing one profile) back, now that there's no admin to manage invites?

---

## 8. Technical PRD (appendix, for engineering)

### 8.1 Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL, accessed via Prisma 7 (`@prisma/adapter-pg`), generated client checked into `src/generated/prisma`
- **Auth:** NextAuth v5 (beta) with the Prisma adapter — email magic-link login via Resend, database session strategy. Open signup: any new email auto-provisions its own `Client` workspace on first sign-in (see `src/lib/auth.ts`)
- **AI generation:** OpenRouter (OpenAI-compatible API, routed to `anthropic/claude-opus-4.8`) for drafting posts
- **Transcription:** OpenAI SDK (Whisper) for voice-note-to-text
- **File storage:** Vercel Blob for uploaded voice notes
- **Email:** Resend, for magic-link auth and check-in reminder emails
- **Scheduling:** Vercel Cron (`vercel.json`), one job: `GET /api/cron/weekly-reminder` every Monday 09:00 UTC (`0 9 * * 1`), authenticated via `CRON_SECRET` bearer token. Filters by each client's `checkInFrequency` before sending.
- **Testing:** Vitest — unit tests cover `isoWeek`, `isCheckInWeek`, `promptBuilder`, and `contentMix` (20 tests, all passing)
- **Package manager:** pnpm
- **Local dev DB:** `docker-compose.yml` spins up Postgres for local development

### 8.2 Data model (`prisma/schema.prisma`)

- **Client** (workspace) — `slug`, `name`, `voiceProfile`, `coreBelief`, `icpPain`, `originStory`, `clientResults` (JSON array of `{situation, outcome}`), `strongOpinions` (JSON array of strings), `contentExamples` (string array), `postingCadence` (int, default 4), `checkInFrequency` (`WEEKLY | BIWEEKLY | MONTHLY` enum, default `WEEKLY`)
- **User** — `email`, `role` (`ADMIN | CLIENT` enum — `ADMIN` is now vestigial, unused since the admin section was removed), optional `clientId` FK (one user → at most one client)
- **Account / Session / VerificationToken** — standard Auth.js tables, no business logic
- **WeeklyInput** — `clientId` FK, `weekNumber` + `year`, four text fields (`whatHappened`, `clientSituation`, `questionAsked`, `industryObs`), optional `voiceNoteUrl`, unique constraint on `(clientId, weekNumber, year)`
- **ContentPost** — `clientId` + `weeklyInputId` FKs, `weekNumber`/`year` (denormalized), `contentType` enum (`INSIGHT | STORY | PROCESS | OPINION | RESULT | OBSERVATION`), `generatedDraft`, optional `editedDraft`, `approved`/`posted` booleans, `postDate`, `linkedinUrl`

Three migrations applied so far: `init`, `add_auth_models`, `add_checkin_frequency`.

### 8.3 Key application code

| File | Responsibility |
|---|---|
| `src/lib/auth.ts` | NextAuth config; `signIn` callback auto-provisions a `Client` for any new email |
| `src/lib/authz.ts` | `requireClient()` — the only auth gate left; redirects to `/login` if unauthenticated |
| `src/lib/clients.ts` | `provisionClientForEmail`, `getClientById`, `updateClientOnboarding` |
| `src/lib/weeklyInputs.ts` | Create/update check-in; triggers generation on first submit for a given period; `getClientsMissingSubmission` filters by `checkInFrequency` |
| `src/lib/blob.ts` | Uploads voice note audio to Vercel Blob, returns URL |
| `src/lib/transcribe.ts` | Sends audio to OpenAI Whisper, returns transcript text |
| `src/lib/contentMix.ts` | Given `postingCadence` + recent post history, picks which `ContentType`s to generate this round, weighting for variety |
| `src/lib/promptBuilder.ts` | Assembles the Claude prompt per content type from profile + check-in + style rules |
| `src/lib/generateContent.ts` | Orchestrates: load check-in → compute mix → build prompt per type → call Claude via OpenRouter → persist each `ContentPost` |
| `src/lib/drafts.ts`, `src/app/api/drafts/[id]/route.ts` | Draft edit/approve/mark-posted logic; API route re-verifies the draft belongs to the requesting client before mutating |
| `src/lib/dashboard.ts` | Aggregates monthly counts (generated/approved/posted) |
| `src/app/api/cron/weekly-reminder/route.ts` | Finds clients with no check-in for the current period per their frequency, emails their users |
| `src/lib/isoWeek.ts` | ISO week/year calc, plus `isCheckInWeek` (frequency-aware reminder gating) |
| `src/components/app-shell.tsx` | Shared sidebar nav shell (nav items, active state, sign-out) used by the client route group |

### 8.4 Route structure

- `src/app/onboarding` — self-serve profile setup, shown to any client whose `voiceProfile` is still empty
- `src/app/(client)/*` — dashboard, weekly input, drafts, grouped under the sidebar app shell; the layout redirects to `/onboarding` if setup isn't complete
- `src/app/api/auth/[...nextauth]` — NextAuth handler
- `src/app/api/drafts/[id]` — draft mutation endpoint
- `src/app/api/cron/weekly-reminder` — cron-triggered reminder job

There is no more `/admin` section — it was removed when the product moved from agency-managed onboarding to fully self-serve signup.

### 8.5 Environment variables (`.env.example`)

`DATABASE_URL`, `AUTH_SECRET`, `OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY` / `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.

`ADMIN_EMAIL` / the seed script are no longer part of the live flow (no more seeded admin), but the script still exists in `prisma/seed.ts` if a manual account needs provisioning.

### 8.6 Known technical gaps

- No end-to-end/integration tests — current test coverage is limited to pure-logic units (`isoWeek`, `isCheckInWeek`, `promptBuilder`, `contentMix`); nothing exercises the DB, auth, or API routes.
- No visible error handling/UI feedback path for failed Blob uploads or failed Whisper transcription.
- No agency/oversight view — removed along with the admin section; if that's needed again it has to be rebuilt.
- Content generation runs sequentially in a loop per post (one Claude call at a time, not parallelized) — fine at current volume, worth revisiting if `postingCadence` or user count grows significantly.
- `checkInFrequency` reminder gating for biweekly/monthly is approximate (based on ISO week number, not calendar months) — documented in `isoWeek.ts`.
