import Link from "next/link";
import { requireClient } from "@/lib/authz";
import { signOut } from "@/lib/auth";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <nav className="sticky top-0 z-10 border-b border-zinc-950/10 bg-white/80 px-6 py-4 backdrop-blur-sm dark:border-white/10 dark:bg-black/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-6">
            <span className="text-zinc-950 dark:text-zinc-50">
              LinkedIn Content Pipeline
            </span>
            <div className="flex gap-5 text-zinc-500 dark:text-zinc-400">
              <Link
                href="/input"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                This week&apos;s input
              </Link>
              <Link
                href="/drafts"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Drafts
              </Link>
              <Link
                href="/dashboard"
                className="transition-colors hover:text-zinc-950 dark:hover:text-zinc-50"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
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
