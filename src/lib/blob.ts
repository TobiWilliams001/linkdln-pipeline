import { put } from "@vercel/blob";

export async function uploadVoiceNote(file: File): Promise<string> {
  const blob = await put(`voice-notes/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: false,
  });
  return blob.url;
}
