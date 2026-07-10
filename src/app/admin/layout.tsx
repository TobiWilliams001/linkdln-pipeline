import Link from "next/link";
import { requireAdmin } from "@/lib/authz";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="flex min-h-screen flex-col">
      <nav className="border-b border-zinc-950/10 px-6 py-4 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl items-center gap-2 text-sm">
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
      </nav>
      {children}
    </div>
  );
}
