import { db } from "@/lib/db";

export async function getDashboardStats(clientId: string, now: Date = new Date()) {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const posts = await db.contentPost.findMany({
    where: { clientId, createdAt: { gte: monthStart, lt: nextMonthStart } },
    orderBy: { createdAt: "desc" },
  });

  const sum = (values: (number | null)[]) =>
    values.reduce((total: number, v) => total + (v ?? 0), 0);

  return {
    posts,
    totalCount: posts.length,
    approvedCount: posts.filter((p) => p.approved).length,
    postedCount: posts.filter((p) => p.posted).length,
    totalImpressions: sum(posts.map((p) => p.impressions)),
    totalLikes: sum(posts.map((p) => p.likes)),
    totalComments: sum(posts.map((p) => p.comments)),
  };
}
