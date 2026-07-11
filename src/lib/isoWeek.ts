export function isoWeek(date: Date): { year: number; weekNumber: number } {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return { year: d.getUTCFullYear(), weekNumber };
}

// Whether the given ISO week is a check-in week for a client on this
// cadence. Biweekly/monthly are approximate - ISO weeks don't align exactly
// with calendar months - but close enough for a reminder cadence.
export function isCheckInWeek(
  frequency: "WEEKLY" | "BIWEEKLY" | "MONTHLY",
  weekNumber: number,
): boolean {
  if (frequency === "BIWEEKLY") return weekNumber % 2 === 0;
  if (frequency === "MONTHLY") return weekNumber % 4 === 1;
  return true;
}
