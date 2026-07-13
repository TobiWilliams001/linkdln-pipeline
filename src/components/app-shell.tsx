"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronsLeftIcon, SettingsIcon, LogOutIcon } from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

const COLLAPSE_KEY = "sidebar-collapsed";

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
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // One-time sync from localStorage on mount - can't read it during SSR,
    // and the resulting flash (server always renders "expanded" briefly)
    // is preferable to a hydration mismatch from guessing client state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen">
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex flex-col border-r border-zinc-950/10 bg-zinc-950/[0.015] py-5 transition-[width] duration-150 dark:border-white/10 dark:bg-white/[0.02] ${
          collapsed ? "w-16 px-2" : "w-60 px-4"
        }`}
      >
        <div className={`mb-6 flex items-center gap-2 px-2 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-xs font-bold text-white dark:bg-zinc-50 dark:text-zinc-950">
            LP
          </div>
          {!collapsed && (
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Content Pipeline
            </span>
          )}
        </div>

        {badge && !collapsed && (
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
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${
                  active
                    ? "bg-zinc-950/[0.06] text-zinc-950 dark:bg-white/10 dark:text-zinc-50"
                    : "text-zinc-600 hover:bg-zinc-950/[0.04] hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-50"
                }`}
              >
                <span className="shrink-0 text-zinc-400 dark:text-zinc-500">
                  {item.icon}
                </span>
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="mb-1 flex items-center justify-center rounded-lg py-2 text-zinc-400 transition-colors hover:bg-zinc-950/[0.04] hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-white/5 dark:hover:text-zinc-50"
        >
          <span className={collapsed ? "rotate-180" : ""}>
            <ChevronsLeftIcon />
          </span>
        </button>

        <div ref={menuRef} className="relative border-t border-zinc-950/10 pt-3 dark:border-white/10">
          {menuOpen && (
            <div className="absolute bottom-full left-0 mb-2 w-52 rounded-xl border border-zinc-950/10 bg-white p-1.5 shadow-lg dark:border-white/10 dark:bg-zinc-900">
              <Link
                href="/onboarding"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/10"
              >
                <SettingsIcon />
                Settings
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-950/5 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  <LogOutIcon />
                  Sign out
                </button>
              </form>
            </div>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-950/[0.04] dark:hover:bg-white/5 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-zinc-950/10 text-xs font-semibold text-zinc-700 dark:bg-white/10 dark:text-zinc-300">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <span className="truncate text-xs text-zinc-500 dark:text-zinc-500">
                {userEmail}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div
        className={`flex-1 transition-[margin] duration-150 ${collapsed ? "ml-16" : "ml-60"}`}
      >
        {children}
      </div>
    </div>
  );
}
