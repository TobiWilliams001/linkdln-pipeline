import { redirect } from "next/navigation";
import { requireClient } from "@/lib/authz";
import { getCurrentWeekInput, submitWeeklyInput } from "@/lib/weeklyInputs";
import { hasDraftsForWeeklyInput } from "@/lib/drafts";
import { generateContentForWeeklyInput } from "@/lib/generateContent";

export default async function WeeklyInputPage() {
  const session = await requireClient();
  const clientId = session.user.clientId as string;

  const existing = await getCurrentWeekInput(clientId);

  async function save(formData: FormData) {
    "use server";
    const weeklyInput = await submitWeeklyInput(clientId, {
      whatHappened: formData.get("whatHappened")?.toString() ?? "",
      clientSituation: formData.get("clientSituation")?.toString() ?? "",
      questionAsked: formData.get("questionAsked")?.toString() ?? "",
      industryObs: formData.get("industryObs")?.toString() ?? "",
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

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-xl font-semibold">This week&apos;s input</h1>
      <p className="mb-6 text-sm text-gray-500">
        Four quick questions. Takes about 10 minutes - this is the raw
        material for this week&apos;s posts.
      </p>

      <form action={save} className="flex flex-col gap-5">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            What happened this week that was interesting?
          </span>
          <textarea
            name="whatHappened"
            rows={3}
            defaultValue={existing?.whatHappened ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            A problem a client brought to you recently - what happened?
          </span>
          <textarea
            name="clientSituation"
            rows={3}
            defaultValue={existing?.clientSituation ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            What question did someone ask you that&apos;s worth answering
            publicly?
          </span>
          <textarea
            name="questionAsked"
            rows={2}
            defaultValue={existing?.questionAsked ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Anything happening in your industry you have a view on?
          </span>
          <textarea
            name="industryObs"
            rows={2}
            defaultValue={existing?.industryObs ?? ""}
            className="rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          {existing ? "Update this week's input" : "Submit"}
        </button>
      </form>
    </main>
  );
}
