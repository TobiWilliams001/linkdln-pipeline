import { NextResponse } from "next/server";
import { getClientsMissingSubmission } from "@/lib/weeklyInputs";
import { sendWeeklyReminder } from "@/lib/email";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await getClientsMissingSubmission();

  let sent = 0;
  for (const client of clients) {
    for (const user of client.users) {
      // eslint-disable-next-line no-await-in-loop
      await sendWeeklyReminder(user.email, client.name);
      sent += 1;
    }
  }

  return NextResponse.json({ remindersSent: sent, clientsMissing: clients.length });
}
