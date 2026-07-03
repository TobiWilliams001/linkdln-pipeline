import { describe, expect, it } from "vitest";
import { contentMix } from "@/lib/contentMix";

const WEEK = { year: 2026, weekNumber: 10 };

describe("contentMix", () => {
  it("with no history, returns the cadence's worth of the highest-weighted types with no duplicates", () => {
    const mix = contentMix(4, [], WEEK);
    expect(mix).toHaveLength(4);
    expect(new Set(mix).size).toBe(4);
    expect(mix[0]).toBe("OBSERVATION");
  });

  it("cadence of 1 always picks OBSERVATION when nothing has run yet", () => {
    expect(contentMix(1, [], WEEK)).toEqual(["OBSERVATION"]);
  });

  it("never repeats a type within a single batch when cadence <= number of types", () => {
    const mix = contentMix(6, [], WEEK);
    expect(new Set(mix).size).toBe(6);
  });

  it("deprioritizes a type that was posted very recently", () => {
    const recentPosts = [
      { contentType: "OBSERVATION" as const, year: 2026, weekNumber: 9 },
      { contentType: "OBSERVATION" as const, year: 2026, weekNumber: 8 },
      { contentType: "OBSERVATION" as const, year: 2026, weekNumber: 7 },
    ];
    const mix = contentMix(1, recentPosts, WEEK);
    // Recently-used OBSERVATION should lose to a never-used type this time.
    expect(mix).not.toEqual(["OBSERVATION"]);
  });

  it("prioritizes a long-neglected type over a recently-used higher-weight type", () => {
    const recentPosts = [
      { contentType: "OBSERVATION" as const, year: 2026, weekNumber: 10 },
      { contentType: "INSIGHT" as const, year: 2026, weekNumber: 9 },
      { contentType: "OPINION" as const, year: 2026, weekNumber: 9 },
      { contentType: "STORY" as const, year: 2026, weekNumber: 9 },
      { contentType: "PROCESS" as const, year: 2026, weekNumber: 9 },
      { contentType: "RESULT" as const, year: 2020, weekNumber: 1 },
    ];
    const mix = contentMix(1, recentPosts, WEEK);
    expect(mix).toEqual(["RESULT"]);
  });

  it("is deterministic for identical inputs", () => {
    const recentPosts = [
      { contentType: "STORY" as const, year: 2026, weekNumber: 9 },
    ];
    const a = contentMix(4, recentPosts, WEEK);
    const b = contentMix(4, recentPosts, WEEK);
    expect(a).toEqual(b);
  });
});
