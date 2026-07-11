import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="flex flex-1 flex-col bg-white dark:bg-black">
      <header className="mx-auto w-full max-w-5xl px-6 py-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50"
        >
          LinkedIn Content Pipeline
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-3 px-6 pb-24 text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-950/5 text-xl dark:bg-white/10">
          &#9993;
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Check your email
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          A sign-in link is on its way. Click it to continue - you can close
          this tab.
        </p>
      </main>
    </div>
  );
}
