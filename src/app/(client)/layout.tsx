import { requireClient } from "@/lib/authz";
import { signOut } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { PencilIcon, FileIcon, ChartIcon } from "@/components/icons";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireClient();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <AppShell
      navItems={[
        { href: "/input", label: "This week's input", icon: <PencilIcon /> },
        { href: "/drafts", label: "Drafts", icon: <FileIcon /> },
        { href: "/dashboard", label: "Dashboard", icon: <ChartIcon /> },
      ]}
      userEmail={session.user.email}
      signOutAction={logout}
    >
      {children}
    </AppShell>
  );
}
