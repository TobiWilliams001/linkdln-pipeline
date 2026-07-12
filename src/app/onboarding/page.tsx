import Link from "next/link";
import { redirect } from "next/navigation";
import { requireClient } from "@/lib/authz";
import { getClientById, updateClientOnboarding } from "@/lib/clients";
import { uploadVoiceNote } from "@/lib/blob";
import { transcribeAudio } from "@/lib/transcribe";
import { signOut } from "@/lib/auth";
import { extractProfileFromFreeform } from "@/lib/extractProfile";
import { SubmitButton } from "@/components/submit-button";

function parseLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

const FREQUENCIES = [
  { value: "WEEKLY", label: "Every week" },
  { value: "BIWEEKLY", label: "Every two weeks" },
  { value: "MONTHLY", label: "Once a month" },
] as const;

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ drafted?: string }>;
}) {
  const session = await requireClient();
  const client = await getClientById(session.user.clientId as string);
  if (!client) redirect("/login");
  const { drafted } = await searchParams;

  async function save(formData: FormData) {
    "use server";

    const clientResults = parseLines(formData.get("clientResults")).map(
      (line) => {
        const [situation, outcome] = line.split("|").map((s) => s.trim());
        return { situation: situation ?? "", outcome: outcome ?? "" };
      },
    );

    let transcript: string | undefined;
    const voiceNote = formData.get("voiceNote");
    if (voiceNote instanceof File && voiceNote.size > 0) {
      const voiceNoteUrl = await uploadVoiceNote(voiceNote);
      transcript = await transcribeAudio(voiceNoteUrl);
    }

    const typedVoiceProfile = formData.get("voiceProfile")?.toString() ?? "";
    const clientId = session.user.clientId as string;

    await updateClientOnboarding(clientId, {
      name: formData.get("name")?.toString() || undefined,
      // Voice note is an alternative to typing/pasting - only used when the
      // voice profile field was left blank.
      voiceProfile: typedVoiceProfile || transcript || "",
      coreBelief: formData.get("coreBelief")?.toString() ?? "",
      icpPain: formData.get("icpPain")?.toString() ?? "",
      originStory: formData.get("originStory")?.toString() ?? "",
      strongOpinions: parseLines(formData.get("strongOpinions")),
      clientResults,
      postingCadence: formData.get("postingCadence")?.toString() ?? "4",
      checkInFrequency: formData.get("checkInFrequency")?.toString() ?? "WEEKLY",
    });

    redirect("/dashboard");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  async function generateProfile(formData: FormData) {
    "use server";

    let text = formData.get("freeform")?.toString() ?? "";
    const voiceNote = formData.get("freeformVoiceNote");
    if (voiceNote instanceof File && voiceNote.size > 0) {
      const voiceNoteUrl = await uploadVoiceNote(voiceNote);
      const transcript = await transcribeAudio(voiceNoteUrl);
      text = text || transcript;
    }
    if (!text.trim()) {
      redirect("/onboarding");
    }

    const extracted = await extractProfileFromFreeform(text);
    const clientId = session.user.clientId as string;

    await updateClientOnboarding(clientId, {
      coreBelief: extracted.coreBelief,
      icpPain: extracted.icpPain,
      originStory: extracted.originStory,
      strongOpinions: extracted.strongOpinions,
      clientResults: extracted.clientResults,
    });

    redirect("/onboarding?drafted=1");
  }

  const isEditing = Boolean(client.voiceProfile);

  const opinionsValue = Array.isArray(client.strongOpinions)
    ? (client.strongOpinions as string[]).join("\n")
    : "";
  const resultsValue = Array.isArray(client.clientResults)
    ? (client.clientResults as { situation: string; outcome: string }[])
        .map((r) => `${r.situation} | ${r.outcome}`)
        .join("\n")
    : "";

  const inputClass =
    "rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30";
  const labelClass = "text-sm font-medium text-zinc-950 dark:text-zinc-50";
  const hintClass = "text-xs text-zinc-500 dark:text-zinc-400";

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <header className="border-b border-zinc-950/10 px-6 py-5 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
          >
            LinkedIn Content Pipeline
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-12">
        {isEditing && (
          <Link
            href="/dashboard"
            className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            &larr; Back to dashboard
          </Link>
        )}
        <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {isEditing ? "Edit your profile" : "Set up your profile"}
        </h1>
        <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
          {isEditing
            ? "Update your voice, beliefs, results, or check-in cadence anytime."
            : "One-time setup so drafts sound like you, not a generic AI. Takes about ten minutes."}
        </p>

        {!isEditing && (
          <div className="mb-8 rounded-xl border border-zinc-950/10 bg-zinc-950/2 p-5 dark:border-white/10 dark:bg-white/3">
            {drafted === "1" && (
              <p className="mb-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                ✓ Drafted from what you shared below — review and edit it in
                the form, then save.
              </p>
            )}
            <h2 className="mb-1 text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Don&apos;t want to fill in six fields cold?
            </h2>
            <p className="mb-3 text-xs text-zinc-500 dark:text-zinc-400">
              Describe your work in a paragraph or two — or just record
              yourself talking about it — and we&apos;ll draft your core
              belief, ideal client, origin story, opinions, and results for
              you to review below.
            </p>
            <form action={generateProfile} className="flex flex-col gap-3">
              <textarea
                name="freeform"
                rows={4}
                placeholder="e.g. I help early-stage startups turn ambitious product ideas into reliable systems. Most failures aren't technical — teams solve the wrong problem..."
                className={inputClass}
              />
              <input
                type="file"
                name="freeformVoiceNote"
                accept="audio/*"
                className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-950 dark:text-zinc-400 dark:file:bg-white/10 dark:file:text-zinc-50"
              />
              <SubmitButton
                pendingLabel="Drafting your profile…"
                className="h-10 w-fit rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Draft my profile
              </SubmitButton>
            </form>
          </div>
        )}

        <form action={save} className="flex flex-col gap-6">
          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Your name or brand</span>
            <input
              type="text"
              name="name"
              placeholder="Jane Smith"
              defaultValue={client.name.includes("@") ? "" : client.name}
              className={`h-11 ${inputClass}`}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Voice profile</span>
            <span className={hintClass}>
              How you actually talk — phrasing, rhythm, words you really use.
              The more specific, the less generic your drafts will sound.
            </span>
            <textarea
              name="voiceProfile"
              rows={6}
              defaultValue={client.voiceProfile ?? ""}
              className={inputClass}
            />
            <span className={hintClass}>
              Or record yourself talking through it instead of typing.
            </span>
            <input
              type="file"
              name="voiceNote"
              accept="audio/*"
              className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-950 dark:text-zinc-400 dark:file:bg-white/10 dark:file:text-zinc-50"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Core belief</span>
            <span className={hintClass}>
              The one thing you think is true about your industry that not
              everyone agrees with.
            </span>
            <textarea
              name="coreBelief"
              rows={2}
              defaultValue={client.coreBelief ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Your ideal client&apos;s problem</span>
            <textarea
              name="icpPain"
              rows={2}
              defaultValue={client.icpPain ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Origin story</span>
            <textarea
              name="originStory"
              rows={3}
              defaultValue={client.originStory ?? ""}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>
              Best client results (one per line: situation | outcome)
            </span>
            <textarea
              name="clientResults"
              rows={4}
              defaultValue={resultsValue}
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>Strong opinions (one per line)</span>
            <textarea
              name="strongOpinions"
              rows={4}
              defaultValue={opinionsValue}
              className={inputClass}
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>Posts per week</span>
              <input
                type="number"
                name="postingCadence"
                min={1}
                max={14}
                defaultValue={client.postingCadence}
                className={`h-11 ${inputClass}`}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className={labelClass}>How often you&apos;ll check in</span>
              <select
                name="checkInFrequency"
                defaultValue={client.checkInFrequency}
                className={`h-11 ${inputClass}`}
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq.value} value={freq.value}>
                    {freq.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <SubmitButton
            pendingLabel="Saving…"
            className="h-11 self-start rounded-lg bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Save and continue
          </SubmitButton>
        </form>
      </main>
    </div>
  );
}
