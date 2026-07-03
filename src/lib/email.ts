import { Resend } from "resend";

export async function sendWeeklyReminder(to: string, clientName: string) {
  // Instantiated lazily, not at module scope: the Resend constructor throws
  // immediately if the API key is missing, which would break the build (and
  // any route that imports this module) before a real key is configured.
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev",
    to,
    subject: "This week's input is waiting",
    text:
      `Hi ${clientName},\n\n` +
      "Quick reminder to submit this week's input - four questions, about " +
      "10 minutes. Your drafts land right after you submit.\n\n" +
      `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/input`,
  });
}
