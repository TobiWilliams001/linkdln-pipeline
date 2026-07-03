import { db } from "@/lib/db";
import { isoWeek } from "@/lib/isoWeek";
import { z } from "zod";

const submitSchema = z.object({
  whatHappened: z.string().optional(),
  clientSituation: z.string().optional(),
  questionAsked: z.string().optional(),
  industryObs: z.string().optional(),
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
