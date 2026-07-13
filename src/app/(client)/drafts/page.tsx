import Link from "next/link";
import { revalidatePath } from "next/cache";
import { requireClient } from "@/lib/authz";
import { getLatestDrafts, logPerformance, markPosted, updateDraft } from "@/lib/drafts";
import { regenerateDraft } from "@/lib/generateContent";
import { SubmitButton } from "@/components/submit-button";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  INSIGHT: "Insight",
  STORY: "Story",
  PROCESS: "Process",
  OPINION: "Opinion",
  RESULT: "Result",
  OBSERVATION: "Observation",
};

function StatusBadge({ draft }: { draft: { approved: boolean; posted: boolean } }) {
  if (draft.posted) {
    return (
      <span className="rounded-full bg-blue-600/10 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-400/10 dark:text-blue-400">
        Posted
      </span>
    );
  }
  if (draft.approved) {
    return (
      <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
        Approved
      </span>
    );
  }
  return (
    <span className="rounded-full bg-zinc-950/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
      Awaiting review
    </span>
  );
}

export default async function DraftsPage({
  searchParams,
}: {
  searchParams: Promise<{ generated?: string; open?: string }>;
}) {
  const session = await requireClient();
  const clientId = session.user.clientId as string;

  const drafts = await getLatestDrafts(clientId);
  const { generated, open } = await searchParams;
  const selected = drafts.find((d) => d.id === open) ?? drafts[0];

  async function save(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await updateDraft(postId, clientId, {
      editedDraft: formData.get("editedDraft")?.toString() ?? "",
    });
    revalidatePath("/drafts");
  }

  async function regenerate(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await regenerateDraft(postId, clientId);
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

  async function saveLogPerformance(formData: FormData) {
    "use server";
    const postId = formData.get("postId")?.toString();
    if (!postId) return;
    await logPerformance(postId, clientId, {
      impressions: formData.get("impressions")?.toString(),
      likes: formData.get("likes")?.toString(),
      comments: formData.get("comments")?.toString(),
    });
    revalidatePath("/drafts");
  }

  return (
    <main className="mx-auto max-w-5xl px-10 py-12">
      {generated === "1" && drafts.length > 0 && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-emerald-600/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
          <span>✓</span>
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} generated from
          this week&apos;s input.
        </div>
      )}
      <h1 className="mb-1 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        Your latest drafts
      </h1>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        Pick one on the left, review it in full on the right, then approve
        when it&apos;s ready to post yourself.
      </p>

      {drafts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No drafts yet. Drafts appear here after you submit your input.
        </p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="flex flex-col gap-2">
            {drafts.map((draft) => {
              const isSelected = selected?.id === draft.id;
              return (
                <Link
                  key={draft.id}
                  href={`/drafts?open=${draft.id}`}
                  className={`rounded-xl border p-4 transition-colors ${
                    isSelected
                      ? "border-zinc-950/20 bg-zinc-950/3 dark:border-white/20 dark:bg-white/5"
                      : "border-zinc-950/10 hover:bg-zinc-950/2 dark:border-white/10 dark:hover:bg-white/3"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {CONTENT_TYPE_LABELS[draft.contentType] ?? draft.contentType}
                    </span>
                    <StatusBadge draft={draft} />
                  </div>
                  <p className="line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {draft.editedDraft ?? draft.generatedDraft}
                  </p>
                </Link>
              );
            })}
          </div>

          {selected && (
            <section className="rounded-xl border border-zinc-950/10 p-6 lg:sticky lg:top-12 lg:self-start dark:border-white/10">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {CONTENT_TYPE_LABELS[selected.contentType] ?? selected.contentType}
                </span>
                <StatusBadge draft={selected} />
              </div>

              <form action={save} className="flex flex-col gap-3">
                <input type="hidden" name="postId" value={selected.id} />
                <textarea
                  name="editedDraft"
                  rows={16}
                  defaultValue={selected.editedDraft ?? selected.generatedDraft}
                  className="min-h-90 rounded-lg border border-zinc-950/10 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-zinc-950 outline-none focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                />
                <div className="flex gap-2">
                  <SubmitButton
                    pendingLabel="Saving…"
                    className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    Save edits
                  </SubmitButton>
                </div>
              </form>

              {!selected.posted && (
                <form action={regenerate} className="mt-2">
                  <input type="hidden" name="postId" value={selected.id} />
                  <SubmitButton
                    pendingLabel="Regenerating…"
                    className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    ↻ Regenerate
                  </SubmitButton>
                </form>
              )}

              {!selected.approved && (
                <form action={approve} className="mt-2">
                  <input type="hidden" name="postId" value={selected.id} />
                  <SubmitButton
                    pendingLabel="Approving…"
                    className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    Approve
                  </SubmitButton>
                </form>
              )}

              {selected.approved && !selected.posted && (
                <form action={markAsPosted} className="mt-2 flex gap-2">
                  <input type="hidden" name="postId" value={selected.id} />
                  <input
                    type="url"
                    name="linkedinUrl"
                    placeholder="LinkedIn post URL (optional)"
                    className="h-10 flex-1 rounded-lg border border-zinc-950/10 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                  />
                  <SubmitButton
                    pendingLabel="Saving…"
                    className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    Mark as posted
                  </SubmitButton>
                </form>
              )}

              {selected.posted && (
                <form
                  action={saveLogPerformance}
                  className="mt-4 flex flex-wrap items-end gap-3 border-t border-zinc-950/10 pt-4 dark:border-white/10"
                >
                  <input type="hidden" name="postId" value={selected.id} />
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Impressions
                    </span>
                    <input
                      type="number"
                      name="impressions"
                      min={0}
                      defaultValue={selected.impressions ?? ""}
                      className="h-9 w-24 rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-950 outline-none focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Likes
                    </span>
                    <input
                      type="number"
                      name="likes"
                      min={0}
                      defaultValue={selected.likes ?? ""}
                      className="h-9 w-24 rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-950 outline-none focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Comments
                    </span>
                    <input
                      type="number"
                      name="comments"
                      min={0}
                      defaultValue={selected.comments ?? ""}
                      className="h-9 w-24 rounded-lg border border-zinc-950/10 bg-transparent px-2 text-sm text-zinc-950 outline-none focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
                    />
                  </label>
                  <SubmitButton
                    pendingLabel="Saving…"
                    className="h-9 rounded-lg border border-zinc-950/10 px-3 text-xs font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
                  >
                    Log performance
                  </SubmitButton>
                </form>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
