import { db } from "@/lib/db";

export async function getDashboardStats(clientId: string, now: Date = new Date()) {
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const posts = await db.contentPost.findMany({
    where: { clientId, createdAt: { gte: monthStart, lt: nextMonthStart } },
    orderBy: { createdAt: "desc" },
  });

  return {
    posts,
    totalCount: posts.length,
    approvedCount: posts.filter((p) => p.approved).length,
    postedCount: posts.filter((p) => p.posted).length,
  };
}
