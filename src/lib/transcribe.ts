import OpenAI from "openai";

export async function transcribeAudio(fileUrl: string): Promise<string> {
  // Instantiated lazily, not at module scope: the OpenAI constructor throws
  // immediately if the API key is missing, which would break the build (and
  // any route that imports this module) before a real key is configured -
  // same failure mode we hit with Resend in email.ts.
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await fetch(fileUrl);
  const buffer = Buffer.from(await response.arrayBuffer());
  const file = new File([buffer], "voice-note.webm", { type: "audio/webm" });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: "whisper-1",
  });

  return transcription.text;
}
