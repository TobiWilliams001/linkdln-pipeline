import { describe, expect, it } from "vitest";
import { isoWeek } from "@/lib/isoWeek";

describe("isoWeek", () => {
  it("returns week 1 for a date in early January", () => {
    expect(isoWeek(new Date("2026-01-01T12:00:00Z"))).toEqual({
      year: 2026,
      weekNumber: 1,
    });
  });

  it("returns the correct mid-year week", () => {
    // 2026-07-03 is a Friday in ISO week 27
    expect(isoWeek(new Date("2026-07-03T12:00:00Z"))).toEqual({
      year: 2026,
      weekNumber: 27,
    });
  });

  it("handles the year-end edge case (Dec 31 belonging to week 1 of next year)", () => {
    // 2025-12-31 is a Wednesday, ISO week 1 of 2026
    expect(isoWeek(new Date("2025-12-31T12:00:00Z"))).toEqual({
      year: 2026,
      weekNumber: 1,
    });
  });

  it("handles the year-start edge case (Jan 1 belonging to week 53 of previous year)", () => {
    // 2027-01-01 is a Friday, still ISO week 53 of 2026
    expect(isoWeek(new Date("2027-01-01T12:00:00Z"))).toEqual({
      year: 2026,
      weekNumber: 53,
    });
  });
});
