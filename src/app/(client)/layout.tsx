import Link from "next/link";
import { requireClient } from "@/lib/authz";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-zinc-950/10 px-6 py-4 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl items-center gap-6 text-sm font-medium">
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
      </nav>
      {children}
    </div>
  );
}
