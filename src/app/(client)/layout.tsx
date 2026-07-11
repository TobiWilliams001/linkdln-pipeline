import { redirect } from "next/navigation";
import { requireClient } from "@/lib/authz";
import { signOut } from "@/lib/auth";
import { getClientById } from "@/lib/clients";
import { AppShell } from "@/components/app-shell";
import { PencilIcon, FileIcon, ChartIcon, UserIcon } from "@/components/icons";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();

  const client = await getClientById(session.user.clientId as string);
  if (!client?.voiceProfile) {
    redirect("/onboarding");
  }

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <AppShell
      navItems={[
        { href: "/dashboard", label: "Dashboard", icon: <ChartIcon /> },
        { href: "/input", label: "This week's input", icon: <PencilIcon /> },
        { href: "/drafts", label: "Drafts", icon: <FileIcon /> },
        { href: "/onboarding", label: "Profile", icon: <UserIcon /> },
      ]}
      userEmail={session.user.email}
      signOutAction={logout}
    >
      {children}
    </AppShell>
  );
}
