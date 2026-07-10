import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getClient, updateClientOnboarding } from "@/lib/clients";
import { uploadVoiceNote } from "@/lib/blob";
import { transcribeAudio } from "@/lib/transcribe";

function parseLines(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default async function ClientOnboardingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

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

    await updateClientOnboarding(id, {
      // Voice note is an alternative to typing/pasting - only used when the
      // voice profile field was left blank.
      voiceProfile: typedVoiceProfile || transcript || "",
      coreBelief: formData.get("coreBelief")?.toString() ?? "",
      icpPain: formData.get("icpPain")?.toString() ?? "",
      originStory: formData.get("originStory")?.toString() ?? "",
      strongOpinions: parseLines(formData.get("strongOpinions")),
      clientResults,
      postingCadence: formData.get("postingCadence")?.toString() ?? "4",
    });

    redirect(`/admin/clients/${id}`);
  }

  const opinionsValue = Array.isArray(client.strongOpinions)
    ? (client.strongOpinions as string[]).join("\n")
    : "";
  const resultsValue = Array.isArray(client.clientResults)
    ? (client.clientResults as { situation: string; outcome: string }[])
        .map((r) => `${r.situation} | ${r.outcome}`)
        .join("\n")
    : "";

  const textareaClass =
    "rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30";
  const labelClass = "text-sm font-medium text-zinc-950 dark:text-zinc-50";
  const hintClass = "text-xs text-zinc-500 dark:text-zinc-400";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/admin/clients/${id}`}
        className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; {client.name}
      </Link>
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Onboarding: {client.name}
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Enter this from the voice-extraction call transcript, not a form the
        client fills in themselves.
      </p>

      <form action={save} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Voice profile</span>
          <span className={hintClass}>
            Close to verbatim from the transcript - phrasing, rhythm, words
            they actually use.
          </span>
          <textarea
            name="voiceProfile"
            rows={6}
            defaultValue={client.voiceProfile ?? ""}
            className={textareaClass}
          />
          <span className={hintClass}>
            Or upload the calibration call recording instead of pasting a
            transcript.
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
          <textarea
            name="coreBelief"
            rows={2}
            defaultValue={client.coreBelief ?? ""}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            Ideal client&apos;s real problem
          </span>
          <textarea
            name="icpPain"
            rows={2}
            defaultValue={client.icpPain ?? ""}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Origin story</span>
          <textarea
            name="originStory"
            rows={3}
            defaultValue={client.originStory ?? ""}
            className={textareaClass}
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
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            Strong opinions (one per line)
          </span>
          <textarea
            name="strongOpinions"
            rows={4}
            defaultValue={opinionsValue}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Posting cadence (per week)</span>
          <input
            type="number"
            name="postingCadence"
            min={1}
            max={14}
            defaultValue={client.postingCadence}
            className={`h-11 w-24 ${textareaClass}`}
          />
        </label>

        <button
          type="submit"
          className="h-11 self-start rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Save
        </button>
      </form>
    </main>
  );
}
