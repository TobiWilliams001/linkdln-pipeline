import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/authz";
import { getCurrentWeekDrafts, markPosted, updateDraft } from "@/lib/drafts";

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

  async function markAsPosted(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await markPosted(postId, clientId, {
      linkedinUrl: formData.get("linkedinUrl")?.toString() ?? "",
    });
    revalidatePath("/drafts");
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        This week&apos;s drafts
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Read each one, edit if you want, then approve when it&apos;s ready to
        post yourself.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No drafts yet for this week. Drafts appear here after you submit
          your weekly input.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {drafts.map((draft) => (
            <section
              key={draft.id}
              className="rounded-xl border border-zinc-950/10 p-5 dark:border-white/10"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {CONTENT_TYPE_LABELS[draft.contentType] ?? draft.contentType}
                </span>
                {draft.posted ? (
                  <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
                    Posted
                  </span>
                ) : draft.approved ? (
                  <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                    Approved
                  </span>
                ) : (
                  <span className="rounded-full bg-zinc-950/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
                    Awaiting review
                  </span>
                )}
              </div>

              <form action={save} className="flex flex-col gap-3">
                <input type="hidden" name="postId" value={draft.id} />
                <textarea
                  name="editedDraft"
                  rows={8}
                  defaultValue={draft.editedDraft ?? draft.generatedDraft}
                  className="rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2 text-sm text-zinc-950 outline-none focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
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
                    className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Approve
                  </button>
                </form>
              )}

              {draft.approved && !draft.posted && (
                <form action={markAsPosted} className="mt-2 flex gap-2">
                  <input type="hidden" name="postId" value={draft.id} />
                  <input
                    type="url"
                    name="linkedinUrl"
                    placeholder="LinkedIn post URL (optional)"
                    className="h-10 flex-1 rounded-lg border border-zinc-950/10 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                  />
                  <button
                    type="submit"
                    className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    Mark as posted
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
