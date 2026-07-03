import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWeeklyReminder(to: string, clientName: string) {
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
