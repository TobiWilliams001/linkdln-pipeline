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
