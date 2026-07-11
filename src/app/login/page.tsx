import Link from "next/link";
import { signIn } from "@/lib/auth";

export default function LoginPage() {
  async function sendMagicLink(formData: FormData) {
    "use server";
    const email = formData.get("email");
    if (typeof email !== "string" || !email) return;
    await signIn("resend", { email, redirectTo: "/" });
  }

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

      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 pb-24">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            Sign in
          </h1>
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            Enter your email and we&apos;ll send you a sign-in link. New here?
            This creates your workspace automatically.
          </p>
        </div>
        <form action={sendMagicLink} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            required
            placeholder="you@example.com"
            className="h-11 rounded-lg border border-zinc-950/10 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
          />
          <button
            type="submit"
            className="h-11 rounded-lg bg-zinc-950 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Send sign-in link
          </button>
        </form>
      </main>
    </div>
  );
}
