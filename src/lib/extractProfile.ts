import OpenAI from "openai";
import { z } from "zod";

const extractedProfileSchema = z.object({
  coreBelief: z.string().default(""),
  icpPain: z.string().default(""),
  originStory: z.string().default(""),
  strongOpinions: z.array(z.string()).default([]),
  clientResults: z
    .array(z.object({ situation: z.string(), outcome: z.string() }))
    .default([]),
});

export type ExtractedProfile = z.infer<typeof extractedProfileSchema>;

function stripCodeFence(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return fenced ? fenced[1] : text;
}

export async function extractProfileFromFreeform(
  freeform: string,
): Promise<ExtractedProfile> {
  const openrouter = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  });

  const prompt = `Someone described their work in their own words below. Extract a
structured profile from it for a LinkedIn content tool. Infer reasonable
answers even if the text doesn't explicitly cover a field - don't leave
fields empty unless there's truly nothing to work with.

Respond with ONLY a JSON object, no other text, in exactly this shape:
{
  "coreBelief": "their core belief or philosophy about their industry, one or two sentences",
  "icpPain": "the real problem their ideal client/customer struggles with",
  "originStory": "a short origin story, a few sentences",
  "strongOpinions": ["a few strong, specific opinions they'd be willing to share, one per array item"],
  "clientResults": [{"situation": "a specific situation", "outcome": "a specific, concrete outcome"}]
}

Their own words:
"""
${freeform}
"""`;

  const completion = await openrouter.chat.completions.create({
    model: "anthropic/claude-opus-4.8",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) {
    throw new Error("OpenRouter response contained no text");
  }

  const parsed = JSON.parse(stripCodeFence(text).trim());
  return extractedProfileSchema.parse(parsed);
}
