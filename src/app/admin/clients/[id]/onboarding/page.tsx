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

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-xl font-semibold">
        Onboarding: {client.name}
      </h1>
      <p className="mb-6 text-sm text-gray-500">
        Enter this from the voice-extraction call transcript, not a form the
        client fills in themselves.
      </p>

      <form action={save} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Voice profile</span>
          <span className="text-xs text-gray-500">
            Close to verbatim from the transcript - phrasing, rhythm, words
            they actually use.
          </span>
          <textarea
            name="voiceProfile"
            rows={6}
            defaultValue={client.voiceProfile ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <span className="text-xs text-gray-500">
            Or upload the calibration call recording instead of pasting a
            transcript.
          </span>
          <input
            type="file"
            name="voiceNote"
            accept="audio/*"
            className="text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Core belief</span>
          <textarea
            name="coreBelief"
            rows={2}
            defaultValue={client.coreBelief ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Ideal client&apos;s real problem
          </span>
          <textarea
            name="icpPain"
            rows={2}
            defaultValue={client.icpPain ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Origin story</span>
          <textarea
            name="originStory"
            rows={3}
            defaultValue={client.originStory ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Best client results (one per line: situation | outcome)
          </span>
          <textarea
            name="clientResults"
            rows={4}
            defaultValue={resultsValue}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Strong opinions (one per line)
          </span>
          <textarea
            name="strongOpinions"
            rows={4}
            defaultValue={opinionsValue}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Posting cadence (per week)</span>
          <input
            type="number"
            name="postingCadence"
            min={1}
            max={14}
            defaultValue={client.postingCadence}
            className="w-24 rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          Save
        </button>
      </form>
    </main>
  );
}
