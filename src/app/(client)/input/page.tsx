import { redirect } from "next/navigation";
import { requireClient } from "@/lib/authz";
import { getCurrentWeekInput, submitWeeklyInput } from "@/lib/weeklyInputs";
import { hasDraftsForWeeklyInput } from "@/lib/drafts";
import { generateContentForWeeklyInput } from "@/lib/generateContent";
import { uploadVoiceNote } from "@/lib/blob";
import { transcribeAudio } from "@/lib/transcribe";

export default async function WeeklyInputPage() {
  const session = await requireClient();
  const clientId = session.user.clientId as string;

  const existing = await getCurrentWeekInput(clientId);

  async function save(formData: FormData) {
    "use server";

    let voiceNoteUrl: string | undefined;
    let transcript: string | undefined;
    const voiceNote = formData.get("voiceNote");
    if (voiceNote instanceof File && voiceNote.size > 0) {
      voiceNoteUrl = await uploadVoiceNote(voiceNote);
      transcript = await transcribeAudio(voiceNoteUrl);
    }

    const typedWhatHappened = formData.get("whatHappened")?.toString() ?? "";

    const weeklyInput = await submitWeeklyInput(clientId, {
      // Voice note is an alternative to typing, not additive - only used
      // when the "what happened" field was left blank.
      whatHappened: typedWhatHappened || transcript || "",
      clientSituation: formData.get("clientSituation")?.toString() ?? "",
      questionAsked: formData.get("questionAsked")?.toString() ?? "",
      industryObs: formData.get("industryObs")?.toString() ?? "",
      voiceNoteUrl,
    });

    // Only generate once per week - resubmitting to edit an earlier answer
    // must not create a second, duplicate batch of drafts.
    const alreadyGenerated = await hasDraftsForWeeklyInput(weeklyInput.id);
    if (!alreadyGenerated) {
      await generateContentForWeeklyInput(weeklyInput.id);
      redirect("/drafts");
    }

    redirect("/input?saved=1");
  }

  const textareaClass =
    "rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30";
  const labelClass = "text-sm font-medium text-zinc-950 dark:text-zinc-50";
  const hintClass = "text-xs text-zinc-500 dark:text-zinc-400";

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        This week&apos;s input
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Four quick questions. Takes about 10 minutes - this is the raw
        material for this week&apos;s posts.
      </p>

      <form action={save} className="flex flex-col gap-6">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            What happened this week that was interesting?
          </span>
          <textarea
            name="whatHappened"
            rows={3}
            defaultValue={existing?.whatHappened ?? ""}
            className={textareaClass}
          />
          <span className={hintClass}>
            Or record a voice note below instead of typing this one.
          </span>
          <input
            type="file"
            name="voiceNote"
            accept="audio/*"
            className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-950/5 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-zinc-950 dark:text-zinc-400 dark:file:bg-white/10 dark:file:text-zinc-50"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            A problem a client brought to you recently - what happened?
          </span>
          <textarea
            name="clientSituation"
            rows={3}
            defaultValue={existing?.clientSituation ?? ""}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            What question did someone ask you that&apos;s worth answering
            publicly?
          </span>
          <textarea
            name="questionAsked"
            rows={2}
            defaultValue={existing?.questionAsked ?? ""}
            className={textareaClass}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>
            Anything happening in your industry you have a view on?
          </span>
          <textarea
            name="industryObs"
            rows={2}
            defaultValue={existing?.industryObs ?? ""}
            className={textareaClass}
          />
        </label>

        <button
          type="submit"
          className="h-11 self-start rounded-lg bg-zinc-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {existing ? "Update this week's input" : "Submit"}
        </button>
      </form>
    </main>
  );
}
