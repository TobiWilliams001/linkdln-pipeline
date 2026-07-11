import { requireClient } from "@/lib/authz";
import { getDashboardStats } from "@/lib/dashboard";

const CONTENT_TYPE_LABELS: Record<string, string> = {
  INSIGHT: "Insight",
  STORY: "Story",
  PROCESS: "Process",
  OPINION: "Opinion",
  RESULT: "Result",
  OBSERVATION: "Observation",
};

function statusLabel(post: { approved: boolean; posted: boolean }) {
  if (post.posted) return "Posted";
  if (post.approved) return "Approved";
  return "Awaiting review";
}

export default async function DashboardPage() {
  const session = await requireClient();
  const clientId = session.user.clientId as string;

  const { posts, totalCount, approvedCount, postedCount } =
    await getDashboardStats(clientId);

  return (
    <main className="mx-auto max-w-2xl px-10 py-12">
      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        This month
      </h1>

      <div className="mb-10 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-zinc-950/3 p-5 text-center dark:bg-white/4">
          <div className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {totalCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Generated</div>
        </div>
        <div className="rounded-xl bg-zinc-950/3 p-5 text-center dark:bg-white/4">
          <div className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {approvedCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Approved</div>
        </div>
        <div className="rounded-xl bg-zinc-950/3 p-5 text-center dark:bg-white/4">
          <div className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50">
            {postedCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Posted</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No posts generated yet this month.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded-xl border border-zinc-950/10 px-4 py-3.5 text-sm transition-colors hover:bg-zinc-950/2 dark:border-white/10 dark:hover:bg-white/3"
            >
              <span className="text-zinc-950 dark:text-zinc-50">
                {CONTENT_TYPE_LABELS[post.contentType] ?? post.contentType}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {statusLabel(post)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
