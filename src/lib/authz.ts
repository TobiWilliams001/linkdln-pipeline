import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }
  return session;
}

export async function requireClient() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENT" || !session.user.clientId) {
    redirect("/login");
  }
  return session;
}
