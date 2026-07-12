import OpenAI from "openai";
import { db } from "@/lib/db";
import { contentMix, type PastPost } from "@/lib/contentMix";
import { promptBuilder } from "@/lib/promptBuilder";

function extractText(completion: OpenAI.Chat.Completions.ChatCompletion): string {
  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenRouter response contained no text");
  }
  return text;
}

function getOpenRouter() {
  // Instantiated lazily, not at module scope: the OpenAI constructor throws
  // immediately if the API key is missing, which would break the build (and
  // any route that imports this module) before a real key is configured -
  // same failure mode we hit with Resend in email.ts.
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });
}

async function callModel(openrouter: OpenAI, prompt: string) {
  const completion = await openrouter.chat.completions.create({
    model: "anthropic/claude-opus-4.8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });
  return extractText(completion);
}

export async function generateContentForWeeklyInput(weeklyInputId: string) {
  const openrouter = getOpenRouter();

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
    const draft = await callModel(openrouter, prompt);

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

export async function regenerateDraft(postId: string, clientId: string) {
  const post = await db.contentPost.findUnique({
    where: { id: postId },
    include: { client: true, weeklyInput: true },
  });
  if (!post || post.clientId !== clientId) {
    throw new Error("Draft not found for this client");
  }
  if (post.posted) {
    throw new Error("Cannot regenerate a post that's already been posted");
  }

  const { client, weeklyInput } = post;

  const clientResults = Array.isArray(client.clientResults)
    ? (client.clientResults as { situation: string; outcome: string }[])
    : [];
  const strongOpinions = Array.isArray(client.strongOpinions)
    ? (client.strongOpinions as string[])
    : [];

  const prompt = promptBuilder(
    post.contentType,
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

  const draft = await callModel(getOpenRouter(), prompt);

  return db.contentPost.update({
    where: { id: postId },
    data: { generatedDraft: draft, editedDraft: null, approved: false },
  });
}
