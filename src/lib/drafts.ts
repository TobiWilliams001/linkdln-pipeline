import { db } from "@/lib/db";
import { isoWeek } from "@/lib/isoWeek";
import { z } from "zod";

export async function getCurrentWeekDrafts(clientId: string, now: Date = new Date()) {
  const { year, weekNumber } = isoWeek(now);
  return db.contentPost.findMany({
    where: { clientId, year, weekNumber },
    orderBy: { createdAt: "asc" },
  });
}

const updateDraftSchema = z.object({
  editedDraft: z.string().optional(),
  approved: z.boolean().optional(),
});

export async function updateDraft(postId: string, clientId: string, input: unknown) {
  const data = updateDraftSchema.parse(input);

  const post = await db.contentPost.findUnique({ where: { id: postId } });
  if (!post || post.clientId !== clientId) {
    throw new Error("Draft not found for this client");
  }

  return db.contentPost.update({ where: { id: postId }, data });
}
