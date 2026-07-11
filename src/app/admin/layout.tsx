import { requireAdmin } from "@/lib/authz";
import { signOut } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";
import { UsersIcon } from "@/components/icons";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <AppShell
      badge="Admin"
      navItems={[{ href: "/admin", label: "Clients", icon: <UsersIcon /> }]}
      userEmail={session.user.email}
      signOutAction={logout}
    >
      {children}
    </AppShell>
  );
}
