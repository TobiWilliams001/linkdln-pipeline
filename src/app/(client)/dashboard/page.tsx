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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">This month</h1>

      <div className="mb-8 grid grid-cols-3 gap-3">
        <div className="rounded border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold">{totalCount}</div>
          <div className="text-xs text-gray-500">Generated</div>
        </div>
        <div className="rounded border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold">{approvedCount}</div>
          <div className="text-xs text-gray-500">Approved</div>
        </div>
        <div className="rounded border border-gray-200 p-4 text-center">
          <div className="text-2xl font-semibold">{postedCount}</div>
          <div className="text-xs text-gray-500">Posted</div>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-gray-500">No posts generated yet this month.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex items-center justify-between rounded border border-gray-200 px-4 py-3 text-sm"
            >
              <span>{CONTENT_TYPE_LABELS[post.contentType] ?? post.contentType}</span>
              <span className="text-xs text-gray-500">{statusLabel(post)}</span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
