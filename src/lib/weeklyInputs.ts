import { db } from "@/lib/db";
import { isoWeek, isCheckInWeek } from "@/lib/isoWeek";
import { z } from "zod";

const submitSchema = z.object({
  whatHappened: z.string().optional(),
  clientSituation: z.string().optional(),
  questionAsked: z.string().optional(),
  industryObs: z.string().optional(),
  voiceNoteUrl: z.string().url().optional(),
});

export async function submitWeeklyInput(
  clientId: string,
  input: unknown,
  now: Date = new Date(),
) {
  const data = submitSchema.parse(input);
  const { year, weekNumber } = isoWeek(now);

  const existing = await db.weeklyInput.findUnique({
    where: { clientId_weekNumber_year: { clientId, weekNumber, year } },
  });

  // Only guard against starting a NEW check-in past the plan length -
  // editing an already-submitted one should always be allowed.
  if (!existing) {
    const { isComplete } = await getPlanStatus(clientId);
    if (isComplete) {
      throw new Error("This plan's check-ins are already complete");
    }
  }

  return db.weeklyInput.upsert({
    where: { clientId_weekNumber_year: { clientId, weekNumber, year } },
    update: data,
    create: { clientId, weekNumber, year, ...data },
  });
}

export async function getCurrentWeekInput(
  clientId: string,
  now: Date = new Date(),
) {
  const { year, weekNumber } = isoWeek(now);
  return db.weeklyInput.findUnique({
    where: { clientId_weekNumber_year: { clientId, weekNumber, year } },
  });
}

export async function getPlanStatus(clientId: string) {
  const client = await db.client.findUniqueOrThrow({ where: { id: clientId } });
  const completed = await db.weeklyInput.count({ where: { clientId } });
  const total = client.planWeeks;

  return {
    completed,
    total,
    isComplete: total !== null && completed >= total,
  };
}

export async function getClientsMissingSubmission(now: Date = new Date()) {
  const { year, weekNumber } = isoWeek(now);

  const clients = await db.client.findMany({
    where: { voiceProfile: { not: null } },
    include: {
      users: true,
      weeklyInputs: { where: { year, weekNumber } },
    },
  });

  return clients.filter(
    (client) =>
      isCheckInWeek(client.checkInFrequency, weekNumber) &&
      client.weeklyInputs.length === 0 &&
      client.users.length > 0,
  );
}
