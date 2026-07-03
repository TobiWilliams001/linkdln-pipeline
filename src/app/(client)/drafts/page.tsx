import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/authz";
import { getCurrentWeekDrafts, updateDraft } from "@/lib/drafts";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  INSIGHT: "Insight",
  STORY: "Story",
  PROCESS: "Process",
  OPINION: "Opinion",
  RESULT: "Result",
  OBSERVATION: "Observation",
};

export default async function DraftsPage() {
  const session = await requireClient();
  const clientId = session.user.clientId as string;

  const drafts = await getCurrentWeekDrafts(clientId);

  async function save(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await updateDraft(postId, clientId, {
      editedDraft: formData.get("editedDraft")?.toString() ?? "",
    });
    revalidatePath("/drafts");
  }

  async function approve(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await updateDraft(postId, clientId, { approved: true });
    revalidatePath("/drafts");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-1 text-xl font-semibold">This week&apos;s drafts</h1>
      <p className="mb-6 text-sm text-gray-500">
        Read each one, edit if you want, then approve when it&apos;s ready to
        post yourself.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-gray-500">
          No drafts yet for this week. Drafts appear here after you submit
          your weekly input.
        </p>
      ) : (
        <div className="flex flex-col gap-8">
          {drafts.map((draft) => (
            <section
              key={draft.id}
              className="rounded border border-gray-200 p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  {CONTENT_TYPE_LABELS[draft.contentType] ?? draft.contentType}
                </span>
                {draft.approved ? (
                  <span className="text-xs font-medium text-green-700">
                    Approved
                  </span>
                ) : null}
              </div>

              <form action={save} className="flex flex-col gap-3">
                <input type="hidden" name="postId" value={draft.id} />
                <textarea
                  name="editedDraft"
                  rows={8}
                  defaultValue={draft.editedDraft ?? draft.generatedDraft}
                  className="rounded border border-gray-300 px-3 py-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    Save edits
                  </button>
                </div>
              </form>

              {!draft.approved && (
                <form action={approve} className="mt-2">
                  <input type="hidden" name="postId" value={draft.id} />
                  <button
                    type="submit"
                    className="rounded bg-black px-3 py-2 text-sm text-white"
                  >
                    Approve
                  </button>
                </form>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
