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

export async function hasDraftsForWeeklyInput(weeklyInputId: string) {
  const count = await db.contentPost.count({ where: { weeklyInputId } });
  return count > 0;
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

const markPostedSchema = z.object({
  linkedinUrl: z.string().url().optional().or(z.literal("")),
});

export async function markPosted(postId: string, clientId: string, input: unknown) {
  const { linkedinUrl } = markPostedSchema.parse(input);

  const post = await db.contentPost.findUnique({ where: { id: postId } });
  if (!post || post.clientId !== clientId) {
    throw new Error("Draft not found for this client");
  }
  if (!post.approved) {
    throw new Error("Cannot mark an unapproved draft as posted");
  }

  return db.contentPost.update({
    where: { id: postId },
    data: {
      posted: true,
      postDate: new Date(),
      linkedinUrl: linkedinUrl || undefined,
    },
  });
}
