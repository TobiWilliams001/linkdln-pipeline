# LinkedIn Content Pipeline — Product Overview

**Status: Working prototype, core loop complete**
*Last updated: July 5, 2026*

---

## 1. What this is

A tool that helps an agency turn a client's raw thoughts into ready-to-post LinkedIn content, every week, with almost no writing effort from the client.

The core idea: instead of asking a busy founder or executive to sit down and "write a LinkedIn post," we ask them four quick questions once a week (about 10 minutes). The system takes their answers, combines them with a profile of how that client actually talks and what they stand for, and produces a batch of ready-to-review draft posts written in their voice. The client just reviews, tweaks if needed, approves, and marks it posted.

---

## 2. Who uses it, and how

### The agency team (admin side)
- Sees a list of every client, with a quick glance at how much each one has submitted and posted.
- Adds new clients in seconds — just a name to start.
- Runs a one-time "onboarding" step per client (typically after a kickoff/calibration call), where the agency captures:
  - How the client actually talks — either typed notes or an audio recording that gets automatically transcribed
  - The core belief or philosophy that drives their content
  - The real problem their ideal customer struggles with
  - Their origin story
  - A few of their best client results (situation → outcome)
  - Strong opinions they're willing to share
  - How many posts per week they want
- Invites the client to log in via email.

### The client
- **Weekly check-in (~10 min):** Four short prompts — something interesting that happened, a recent client situation, a question worth asking publicly, and an industry observation. The first one can be answered by voice note instead of typing (it gets transcribed automatically).
- **Drafts inbox:** As soon as they submit their weekly check-in, the system automatically generates a batch of draft posts. The client reviews each one, can edit the wording, and approves it.
- **Mark as posted:** Once approved, they can mark a post as published and optionally paste the live LinkedIn link, so everything is tracked in one place.
- **Dashboard:** A simple monthly snapshot — how many posts were generated, how many approved, how many actually went live — plus a list of the month's posts and their status.

---

## 3. What's automated vs. manual today

| Step | Who/what does it |
|---|---|
| Client onboarding (voice profile, beliefs, results) | Agency staff, manual, one-time per client |
| Weekly reminder if a client hasn't submitted | **Automatic** — scheduled email, no one has to chase clients |
| Turning weekly input into draft posts | **Automatic** — kicks off the moment the client submits |
| Deciding what *kind* of posts to write (see below) | **Automatic** |
| Writing the actual post copy | **Automatic** (AI-generated, in the client's voice) |
| Reviewing, editing, approving | Client, manual |
| Actually posting to LinkedIn | Client, manual (we don't auto-publish) |

---

## 4. The "content mix"

Rather than generating the same type of post every time, the system rotates through six content styles: **Insight, Story, Process, Opinion, Result, and Observation.**

It leans toward variety — it avoids repeating a type that was used recently, leans a bit more on Observations and Insights (easy to generate consistently), and leans less on Results (since those depend on a limited supply of real client success stories). How many posts get made each week is driven by the cadence the client chose during onboarding.

Every draft is written using a style guide baked into the system: no marketing buzzwords, no bullet-point lists, concrete real examples, and posts end with a question rather than a sales pitch.

---

## 5. What's captured behind the scenes

In plain terms, the system keeps track of:
- **Clients** — their profile, voice, beliefs, results, and desired posting pace
- **Users** — login accounts, either agency staff or a client contact
- **Weekly Check-ins** — each week's answers per client, including any voice note
- **Posts** — each individual draft: its type, the AI-written text, any client edits, whether it's approved, whether it's posted, and the live link once posted

---

## 6. Where things stand

All of the above is built and working end-to-end on the `main` branch:
- Admin can onboard clients and invite them ✅
- Clients can submit weekly input, including voice notes ✅
- Drafts are auto-generated in a mixed variety of content types ✅
- Clients can review, edit, approve, and mark posts as posted ✅
- Clients have a monthly progress dashboard ✅
- Automated weekly reminder emails for clients who haven't checked in ✅

### Open items / things to sanity-check before wider rollout
- No public-facing docs or onboarding guide yet (the app's README is still the default Next.js template).
- Worth confirming error handling for the voice-note transcription step — e.g., what a client sees if a recording fails to upload or transcribe.
- No analytics/reporting beyond the single-client monthly dashboard (e.g., no agency-wide view across all clients yet).
- No auto-publish to LinkedIn — posting itself is still a manual, client-side step.

---

## 7. Suggested next conversations with the team

1. Do we want an agency-wide dashboard (all clients at a glance), or is per-client enough for now?
2. Should we auto-publish to LinkedIn eventually, or is manual posting a deliberate choice (e.g., for compliance/review reasons)?
3. What's our fallback plan if voice transcription fails — silent retry, error message, or manual fallback?
4. Do we need a real onboarding/help doc before handing this to non-technical team members or clients?

---

## 8. Technical PRD (appendix, for engineering)

### 8.1 Stack
- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Database:** PostgreSQL, accessed via Prisma 7 (`@prisma/adapter-pg`), generated client checked into `src/generated/prisma`
- **Auth:** NextAuth v5 (beta) with the Prisma adapter — email magic-link login via Resend, session/user/account tables are standard Auth.js models
- **AI generation:** Anthropic SDK (`claude-opus-4-8`, adaptive thinking) for drafting posts
- **Transcription:** OpenAI SDK (Whisper) for voice-note-to-text
- **File storage:** Vercel Blob for uploaded voice notes
- **Email:** Resend, for magic-link auth and weekly reminder emails
- **Scheduling:** Vercel Cron (`vercel.json`), one job: `GET /api/cron/weekly-reminder` every Monday 09:00 UTC (`0 9 * * 1`), authenticated via `CRON_SECRET` bearer token
- **Testing:** Vitest — unit tests currently cover `isoWeek`, `promptBuilder`, and `contentMix` (17 tests, all passing)
- **Package manager:** pnpm
- **Local dev DB:** `docker-compose.yml` spins up Postgres for local development

### 8.2 Data model (`prisma/schema.prisma`)

- **Client** — `slug`, `name`, `voiceProfile`, `coreBelief`, `icpPain`, `originStory`, `clientResults` (JSON array of `{situation, outcome}`), `strongOpinions` (JSON array of strings), `contentExamples` (string array), `postingCadence` (int, default 4)
- **User** — `email`, `role` (`ADMIN` | `CLIENT` enum), optional `clientId` FK (one user → at most one client)
- **Account / Session / VerificationToken** — standard Auth.js tables, no business logic
- **WeeklyInput** — `clientId` FK, `weekNumber` + `year`, four text fields (`whatHappened`, `clientSituation`, `questionAsked`, `industryObs`), optional `voiceNoteUrl`, unique constraint on `(clientId, weekNumber, year)`
- **ContentPost** — `clientId` + `weeklyInputId` FKs, `weekNumber`/`year` (denormalized), `contentType` enum (`INSIGHT | STORY | PROCESS | OPINION | RESULT | OBSERVATION`), `generatedDraft`, optional `editedDraft`, `approved`/`posted` booleans, `postDate`, `linkedinUrl`

Two migrations applied so far: `init` and `add_auth_models`.

### 8.3 Key application code

| File | Responsibility |
|---|---|
| `src/lib/auth.ts`, `src/lib/authz.ts` | NextAuth config + role/ownership authorization helpers |
| `src/lib/clients.ts` | Client CRUD for admin pages |
| `src/lib/weeklyInputs.ts` | Create/update weekly input; triggers generation on first submit for a given week |
| `src/lib/blob.ts` | Uploads voice note audio to Vercel Blob, returns URL |
| `src/lib/transcribe.ts` | Sends audio to OpenAI Whisper, returns transcript text |
| `src/lib/contentMix.ts` | Given `postingCadence` + recent post history, picks which `ContentType`s to generate this week, weighting for variety (deprioritizes types used in the last N weeks; upweights Observation/Insight, downweights Result) |
| `src/lib/promptBuilder.ts` | Assembles the Claude prompt per content type from client profile + weekly input + style rules |
| `src/lib/generateContent.ts` | Orchestrates: load weekly input → compute mix → build prompt per type → call Claude (`claude-opus-4-8`) → persist each `ContentPost` |
| `src/lib/drafts.ts`, `src/app/api/drafts/[id]/route.ts` | Draft edit/approve/mark-posted logic; API route re-verifies the draft belongs to the requesting client before mutating |
| `src/lib/dashboard.ts` | Aggregates monthly counts (generated/approved/posted) for the client dashboard |
| `src/app/api/cron/weekly-reminder/route.ts` | Finds clients with no `WeeklyInput` for the current ISO week, emails all their users via `src/lib/email.ts` |
| `src/lib/isoWeek.ts` | ISO week/year calculation helper (used to key `WeeklyInput` and to detect "current week" for reminders) |

### 8.4 Route structure

- `src/app/admin/*` — agency-only pages (client list, new client, client detail, onboarding form)
- `src/app/(client)/*` — client-only pages (dashboard, weekly input, drafts), grouped under a shared layout
- `src/app/api/auth/[...nextauth]` — NextAuth handler
- `src/app/api/drafts/[id]` — draft mutation endpoint
- `src/app/api/cron/weekly-reminder` — cron-triggered reminder job

Route-level access control is enforced via `src/lib/authz.ts` (role checks for admin routes, client-ownership checks for client routes and the drafts API).

### 8.5 Environment variables (`.env.example`)

`DATABASE_URL`, `AUTH_SECRET`, `ADMIN_EMAIL` (seeded admin), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `RESEND_API_KEY` / `RESEND_FROM_EMAIL`, `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`.

### 8.6 Known technical gaps

- No end-to-end/integration tests — current test coverage is limited to three pure-logic units (`isoWeek`, `promptBuilder`, `contentMix`); nothing exercises the DB, auth, or API routes.
- No visible error handling/UI feedback path for failed Blob uploads or failed Whisper transcription in the weekly-input or onboarding forms — needs verification.
- `src/generated/prisma` (the generated Prisma client) is checked into `src/`, not gitignored into a build artifact location — worth confirming this is intentional.
- No agency-wide aggregate queries yet — `dashboard.ts` is scoped to a single client; an agency-wide view would need new queries, not just new UI.
- Content generation runs sequentially in a loop per post (one Claude call at a time, not parallelized) — fine at current volume, worth revisiting if `postingCadence` or client count grows significantly.
