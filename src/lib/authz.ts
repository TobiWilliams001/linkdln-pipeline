import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireClient() {
  const session = await auth();
  if (!session || !session.user.clientId) {
    redirect("/login");
  }
  return session;
}
