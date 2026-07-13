import { db } from "@/lib/db";
import { z } from "zod";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function provisionClientForEmail(email: string) {
  const baseSlug = slugify(email.split("@")[0]) || "client";
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.client.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  // name defaults to the email; the client renames themselves during onboarding.
  return db.client.create({ data: { name: email, slug } });
}

export async function getClientById(id: string) {
  return db.client.findUnique({ where: { id } });
}

const onboardingSchema = z.object({
  name: z.string().min(1).optional(),
  voiceProfile: z.string().optional(),
  coreBelief: z.string().optional(),
  icpPain: z.string().optional(),
  originStory: z.string().optional(),
  clientResults: z
    .array(z.object({ situation: z.string(), outcome: z.string() }))
    .optional(),
  strongOpinions: z.array(z.string()).optional(),
  postingCadence: z.coerce.number().int().min(1).max(14).optional(),
  checkInFrequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY"]).optional(),
  // Total number of check-ins the plan covers. Empty/null means ongoing,
  // no end date - preprocess so an empty form field clears it rather than
  // coercing to 0 (which would fail the min(1) check below).
  planWeeks: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.coerce.number().int().min(1).max(104).nullable().optional(),
  ),
});

export async function updateClientOnboarding(id: string, input: unknown) {
  const data = onboardingSchema.parse(input);
  return db.client.update({ where: { id }, data });
}
