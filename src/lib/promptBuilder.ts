import type { ContentTypeName } from "@/lib/contentMix";

export interface ClientProfile {
  name: string;
  voiceProfile: string | null;
  coreBelief: string | null;
  icpPain: string | null;
  originStory: string | null;
  clientResults: { situation: string; outcome: string }[];
  strongOpinions: string[];
  contentExamples: string[];
}

export interface WeeklyInputMaterial {
  whatHappened: string | null;
  clientSituation: string | null;
  questionAsked: string | null;
  industryObs: string | null;
}

const STRUCTURE_GUIDE: Record<ContentTypeName, string> = {
  INSIGHT:
    "Start with a counter-intuitive statement. Explain why most people " +
    "believe the opposite. Give evidence from the client's own experience. " +
    "End with a practical implication for the reader.",
  STORY:
    "Describe a specific client situation (anonymised). What was happening, " +
    "what the client did about it, what changed as a result. Concrete and " +
    "specific, not a generic case-study summary.",
  PROCESS:
    "Explain exactly how the client does something, step by step. " +
    "Behind-the-scenes detail that demonstrates real competence, not a " +
    "generic listicle.",
  OPINION:
    "State a clear, specific position on something happening in the " +
    "client's industry right now. Not fence-sitting - an actual take, " +
    "with the reasoning behind it.",
  RESULT:
    "Describe a specific outcome from the client's work. Concrete numbers " +
    "and a specific situation, not a vague 'helped a client grow' claim.",
  OBSERVATION:
    "Something the client noticed recently that connects to a pattern in " +
    "their work. Short and punchy - a few sentences, not a full essay.",
};

const CONSTRAINTS = `
Constraints:
- No buzzwords: "synergy", "game-changing", "excited to share", "leverage", "unlock".
- No corporate speak or generic LinkedIn-guru phrasing.
- No bullet-point lists that read like a PowerPoint slide.
- No em dashes.
- No vague claims - every claim needs a specific, concrete example behind it.
- The first line must not start with "I" and must not be a question. It should
  create tension or curiosity that stops the scroll.
- End with a question or invitation for the reader to respond - never a pitch
  or a "DM me" call to action.
`.trim();

function pickWeeklyMaterial(
  contentType: ContentTypeName,
  weeklyInput: WeeklyInputMaterial,
): string {
  switch (contentType) {
    case "STORY":
      return weeklyInput.clientSituation ?? weeklyInput.whatHappened ?? "";
    case "INSIGHT":
    case "OPINION":
      return weeklyInput.industryObs ?? weeklyInput.whatHappened ?? "";
    case "PROCESS":
    case "OBSERVATION":
      return weeklyInput.whatHappened ?? "";
    case "RESULT":
      // RESULT draws primarily on onboarding results, not the weekly input.
      return weeklyInput.whatHappened ?? "";
  }
}

export function promptBuilder(
  contentType: ContentTypeName,
  client: ClientProfile,
  weeklyInput: WeeklyInputMaterial,
): string {
  const sections: string[] = [];

  sections.push(
    `Write a LinkedIn post for ${client.name}, an ${contentType.toLowerCase()} post.`,
  );

  if (client.voiceProfile) {
    sections.push(
      `Voice: write close to how they actually talk, based on this transcript-derived profile:\n${client.voiceProfile}`,
    );
  }

  if (client.coreBelief) {
    sections.push(`Their core belief about their industry:\n${client.coreBelief}`);
  }

  if (client.icpPain) {
    sections.push(`Their ideal client's real, underlying problem:\n${client.icpPain}`);
  }

  if (contentType === "RESULT" && client.clientResults.length > 0) {
    const results = client.clientResults
      .map((r) => `- Situation: ${r.situation}\n  Outcome: ${r.outcome}`)
      .join("\n");
    sections.push(`Pick the result that best fits this post from their best results:\n${results}`);
  }

  if (contentType === "OPINION" && client.strongOpinions.length > 0) {
    sections.push(`Their strong opinions to draw on:\n${client.strongOpinions.join("\n")}`);
  }

  const material = pickWeeklyMaterial(contentType, weeklyInput);
  if (material) {
    sections.push(`This week's raw material to use:\n${material}`);
  }

  if (client.contentExamples.length > 0) {
    sections.push(
      `Past posts of theirs, for voice calibration only (don't repeat their content):\n${client.contentExamples.join("\n---\n")}`,
    );
  }

  sections.push(`Structure for this post type:\n${STRUCTURE_GUIDE[contentType]}`);
  sections.push(CONSTRAINTS);

  return sections.join("\n\n");
}
