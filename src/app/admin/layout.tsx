import Link from "next/link";
import { requireAdmin } from "@/lib/authz";
import { signOut } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 border-b border-zinc-950/10 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              LinkedIn Content Pipeline
            </Link>
            <span className="rounded-full bg-zinc-950/5 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
              Admin
            </span>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="font-medium text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
