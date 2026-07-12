import { db } from "@/lib/db";
import { z } from "zod";

// Drafts for the most recent check-in, not strictly "this calendar week" -
// with biweekly/monthly cadences the ISO week can roll over before a client
// gets around to reviewing, which would otherwise make their still-pending
// drafts disappear from this page entirely.
export async function getLatestDrafts(clientId: string) {
  const latestInput = await db.weeklyInput.findFirst({
    where: { clientId },
    orderBy: { submittedAt: "desc" },
  });
  if (!latestInput) return [];

  return db.contentPost.findMany({
    where: { clientId, weeklyInputId: latestInput.id },
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

const logPerformanceSchema = z.object({
  impressions: z.coerce.number().int().min(0).optional(),
  likes: z.coerce.number().int().min(0).optional(),
  comments: z.coerce.number().int().min(0).optional(),
});

export async function logPerformance(postId: string, clientId: string, input: unknown) {
  const data = logPerformanceSchema.parse(input);

  const post = await db.contentPost.findUnique({ where: { id: postId } });
  if (!post || post.clientId !== clientId) {
    throw new Error("Draft not found for this client");
  }
  if (!post.posted) {
    throw new Error("Can only log performance for a posted draft");
  }

  return db.contentPost.update({ where: { id: postId }, data });
}
