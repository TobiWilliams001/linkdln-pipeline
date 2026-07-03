import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { contentMix, type PastPost } from "@/lib/contentMix";
import { promptBuilder } from "@/lib/promptBuilder";

const anthropic = new Anthropic();

function extractText(message: Anthropic.Message): string {
  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude response contained no text block");
  }
  return textBlock.text;
}

export async function generateContentForWeeklyInput(weeklyInputId: string) {
  const weeklyInput = await db.weeklyInput.findUniqueOrThrow({
    where: { id: weeklyInputId },
    include: { client: true },
  });
  const { client } = weeklyInput;

  const recentPostRows = await db.contentPost.findMany({
    where: { clientId: client.id },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: { contentType: true, year: true, weekNumber: true },
  });
  const recentPosts: PastPost[] = recentPostRows;

  const targetWeek = { year: weeklyInput.year, weekNumber: weeklyInput.weekNumber };
  const types = contentMix(client.postingCadence, recentPosts, targetWeek);

  const clientResults = Array.isArray(client.clientResults)
    ? (client.clientResults as { situation: string; outcome: string }[])
    : [];
  const strongOpinions = Array.isArray(client.strongOpinions)
    ? (client.strongOpinions as string[])
    : [];

  const created = [];
  for (const contentType of types) {
    const prompt = promptBuilder(
      contentType,
      {
        name: client.name,
        voiceProfile: client.voiceProfile,
        coreBelief: client.coreBelief,
        icpPain: client.icpPain,
        originStory: client.originStory,
        clientResults,
        strongOpinions,
        contentExamples: client.contentExamples,
      },
      {
        whatHappened: weeklyInput.whatHappened,
        clientSituation: weeklyInput.clientSituation,
        questionAsked: weeklyInput.questionAsked,
        industryObs: weeklyInput.industryObs,
      },
    );

    // eslint-disable-next-line no-await-in-loop
    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      messages: [{ role: "user", content: prompt }],
    });

    const draft = extractText(message);

    // eslint-disable-next-line no-await-in-loop
    const post = await db.contentPost.create({
      data: {
        clientId: client.id,
        weeklyInputId: weeklyInput.id,
        weekNumber: weeklyInput.weekNumber,
        year: weeklyInput.year,
        contentType,
        generatedDraft: draft,
      },
    });
    created.push(post);
  }

  return created;
}
