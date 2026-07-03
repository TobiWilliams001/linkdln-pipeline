import { describe, expect, it } from "vitest";
import { promptBuilder, type ClientProfile, type WeeklyInputMaterial } from "@/lib/promptBuilder";

const client: ClientProfile = {
  name: "Jane Doe",
  voiceProfile: "Short punchy sentences. No corporate speak.",
  coreBelief: "Most consultants overcomplicate onboarding.",
  icpPain: "They're embarrassed they never wrote a proper contract.",
  originStory: "Started after watching a friend get burned by a bad client.",
  clientResults: [
    { situation: "Client had no pipeline", outcome: "Booked 12 calls in 6 weeks" },
  ],
  strongOpinions: ["Discovery calls are overrated"],
  contentExamples: ["An old post about onboarding."],
};

const weeklyInput: WeeklyInputMaterial = {
  whatHappened: "Landed a big client this week",
  clientSituation: "A client had messy onboarding docs",
  questionAsked: "How do you price retainers?",
  industryObs: "Everyone's talking about AI replacing consultants",
};

describe("promptBuilder", () => {
  it("includes the correct structure guide per content type", () => {
    expect(promptBuilder("INSIGHT", client, weeklyInput)).toContain(
      "counter-intuitive statement",
    );
    expect(promptBuilder("STORY", client, weeklyInput)).toContain(
      "specific client situation",
    );
    expect(promptBuilder("PROCESS", client, weeklyInput)).toContain(
      "step by step",
    );
    expect(promptBuilder("OPINION", client, weeklyInput)).toContain(
      "clear, specific position",
    );
    expect(promptBuilder("RESULT", client, weeklyInput)).toContain(
      "specific outcome",
    );
    expect(promptBuilder("OBSERVATION", client, weeklyInput)).toContain(
      "Short and punchy",
    );
  });

  it("picks clientSituation for STORY posts", () => {
    const prompt = promptBuilder("STORY", client, weeklyInput);
    expect(prompt).toContain("A client had messy onboarding docs");
  });

  it("picks industryObs for INSIGHT and OPINION posts", () => {
    expect(promptBuilder("INSIGHT", client, weeklyInput)).toContain(
      "Everyone's talking about AI replacing consultants",
    );
    expect(promptBuilder("OPINION", client, weeklyInput)).toContain(
      "Everyone's talking about AI replacing consultants",
    );
  });

  it("includes clientResults only for RESULT posts", () => {
    const resultPrompt = promptBuilder("RESULT", client, weeklyInput);
    expect(resultPrompt).toContain("Booked 12 calls in 6 weeks");

    const insightPrompt = promptBuilder("INSIGHT", client, weeklyInput);
    expect(insightPrompt).not.toContain("Booked 12 calls in 6 weeks");
  });

  it("includes strongOpinions only for OPINION posts", () => {
    const opinionPrompt = promptBuilder("OPINION", client, weeklyInput);
    expect(opinionPrompt).toContain("Discovery calls are overrated");

    const storyPrompt = promptBuilder("STORY", client, weeklyInput);
    expect(storyPrompt).not.toContain("Discovery calls are overrated");
  });

  it("always includes the shared constraints block", () => {
    for (const type of ["INSIGHT", "STORY", "PROCESS", "OPINION", "RESULT", "OBSERVATION"] as const) {
      const prompt = promptBuilder(type, client, weeklyInput);
      expect(prompt).toContain("No em dashes");
      expect(prompt).toContain("No buzzwords");
    }
  });

  it("handles a client with no voice profile or results gracefully", () => {
    const bareClient: ClientProfile = {
      name: "New Client",
      voiceProfile: null,
      coreBelief: null,
      icpPain: null,
      originStory: null,
      clientResults: [],
      strongOpinions: [],
      contentExamples: [],
    };
    const emptyInput: WeeklyInputMaterial = {
      whatHappened: null,
      clientSituation: null,
      questionAsked: null,
      industryObs: null,
    };
    expect(() => promptBuilder("OBSERVATION", bareClient, emptyInput)).not.toThrow();
  });
});
