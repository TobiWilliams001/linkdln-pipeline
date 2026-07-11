import Link from "next/link";
import { auth } from "@/lib/auth";

const highlights = ["Written in your voice", "No blank page", "Ready in minutes"];

const steps = [
  {
    label: "01",
    title: "Share what's on your mind",
    body: "A few quick prompts, on your schedule. Type it out or just talk — whatever's faster.",
  },
  {
    label: "02",
    title: "Get drafts back",
    body: "Ready-to-post content, written in your voice — not generic AI copy.",
  },
  {
    label: "03",
    title: "Approve and post",
    body: "Tweak anything that's off, approve it, and post it yourself when you're ready.",
  },
];

export default async function Home() {
  const session = await auth();
  const loggedInHref = session?.user ? "/dashboard" : "/login";

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-white dark:bg-black">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(80%_60%_at_50%_-10%,rgba(0,0,0,0.06),transparent)] dark:[background:radial-gradient(80%_60%_at_50%_-10%,rgba(255,255,255,0.08),transparent)]"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          LinkedIn Content Pipeline
        </span>
        <Link
          href={loggedInHref}
          className="rounded-full border border-zinc-950/10 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          {session?.user ? "Go to workspace" : "Sign in"}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-7 px-6 pt-12 pb-20 text-center">
        <span className="w-fit rounded-full bg-zinc-950/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
          No ghostwriter, no blank page
        </span>
        <h1 className="max-w-2xl text-5xl font-semibold leading-[1.1] tracking-tight text-zinc-950 sm:text-6xl dark:text-zinc-50">
          Turn ten minutes a week into a month of LinkedIn content.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Ready-to-post drafts, written in your voice, delivered on your
          schedule — no writer&apos;s block, no scrambling for what to post.
        </p>

        <div className="mt-1 flex flex-wrap justify-center gap-2">
          {highlights.map((item) => (
            <span
              key={item}
              className="rounded-full border border-zinc-950/10 px-3 py-1.5 text-xs font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-400"
            >
              {item}
            </span>
          ))}
        </div>

        <Link
          href={loggedInHref}
          className="mt-3 inline-flex h-12 w-fit items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {session?.user ? "Go to workspace" : "Get started"}
        </Link>
      </main>

      <section className="mx-auto w-full max-w-5xl border-t border-zinc-950/10 px-6 py-16 dark:border-white/10">
        <div className="grid gap-10 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.label} className="flex flex-col gap-3 text-left">
              <span className="text-sm font-semibold text-zinc-400 dark:text-zinc-600">
                {step.label}
              </span>
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-zinc-50">
                {step.title}
              </h2>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto w-full max-w-5xl border-t border-zinc-950/10 px-6 py-8 text-xs text-zinc-500 dark:border-white/10 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} LinkedIn Content Pipeline
      </footer>
    </div>
  );
}
