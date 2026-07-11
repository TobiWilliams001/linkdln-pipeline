"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

export function AppShell({
  badge,
  navItems,
  userEmail,
  signOutAction,
  children,
}: {
  badge?: string;
  navItems: NavItem[];
  userEmail: string;
  signOutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col border-r border-zinc-950/10 bg-zinc-950/[0.015] px-4 py-5 dark:border-white/10 dark:bg-white/[0.02]">
        <div className="mb-6 flex items-center gap-2 px-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-950">
            LP
          </div>
          <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Content Pipeline
          </span>
        </div>

        {badge && (
          <span className="mb-4 w-fit rounded-full bg-zinc-950/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
            {badge}
          </span>
        )}

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-zinc-950/[0.06] text-zinc-950 dark:bg-white/10 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-950/[0.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-50"
                }`}
              >
                <span className="text-zinc-400 dark:text-zinc-500">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-950/10 pt-3 dark:border-white/10">
          <p className="mb-2 truncate px-2.5 text-xs text-zinc-500 dark:text-zinc-500">
            {userEmail}
          </p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg px-2.5 py-2 text-left text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-950/[0.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="ml-60 flex-1">{children}</div>
    </div>
  );
}
