import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6">
        <span className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          LinkedIn Content Pipeline
        </span>
        <Link
          href="/login"
          className="rounded-full border border-zinc-950/10 px-4 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center gap-6 px-6 pb-24">
        <span className="rounded-full bg-zinc-950/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
          For agencies, not just founders
        </span>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl dark:text-zinc-50">
          Turn ten minutes a week into a month of LinkedIn content.
        </h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Ready-to-post drafts written in your voice — no ghostwriter on call,
          no blank page.
        </p>
        <Link
          href="/login"
          className="mt-2 inline-flex h-12 w-fit items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Sign in to your workspace
        </Link>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-6 py-8 text-xs text-zinc-500 dark:text-zinc-500">
        &copy; {new Date().getFullYear()} LinkedIn Content Pipeline
      </footer>
    </div>
  );
}
