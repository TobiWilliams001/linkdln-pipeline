import { db } from "@/lib/db";
import { z } from "zod";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function listClients() {
  return db.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { weeklyInputs: true, contentPosts: true, users: true } },
    },
  });
}

const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export async function createClient(input: unknown) {
  const { name } = createClientSchema.parse(input);

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.client.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return db.client.create({ data: { name, slug } });
}

export async function getClient(id: string) {
  return db.client.findUnique({
    where: { id },
    include: {
      users: true,
      weeklyInputs: { orderBy: { submittedAt: "desc" }, take: 5 },
      contentPosts: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

const onboardingSchema = z.object({
  voiceProfile: z.string().optional(),
  coreBelief: z.string().optional(),
  icpPain: z.string().optional(),
  originStory: z.string().optional(),
  clientResults: z
    .array(z.object({ situation: z.string(), outcome: z.string() }))
    .optional(),
  strongOpinions: z.array(z.string()).optional(),
  postingCadence: z.coerce.number().int().min(1).max(14).optional(),
});

export async function updateClientOnboarding(id: string, input: unknown) {
  const data = onboardingSchema.parse(input);
  return db.client.update({ where: { id }, data });
}

const inviteSchema = z.object({
  email: z.string().email(),
});

export async function inviteClientUser(clientId: string, input: unknown) {
  const { email } = inviteSchema.parse(input);
  // upsert: if the admin re-invites the same email, it just re-links them
  // to this client rather than erroring on a duplicate.
  return db.user.upsert({
    where: { email },
    update: { role: "CLIENT", clientId },
    create: { email, role: "CLIENT", clientId },
  });
}
