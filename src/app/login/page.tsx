import { signIn } from "@/lib/auth";

export default function LoginPage() {
  async function sendMagicLink(formData: FormData) {
    "use server";
    const email = formData.get("email");
    if (typeof email !== "string" || !email) return;
    await signIn("resend", { email, redirectTo: "/" });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-xl font-semibold">Sign in</h1>
      <p className="text-sm text-gray-500">
        Enter your email. If it&apos;s already set up, we&apos;ll send you a
        sign-in link.
      </p>
      <form action={sendMagicLink} className="flex flex-col gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="you@example.com"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          Send sign-in link
        </button>
      </form>
    </main>
  );
}
