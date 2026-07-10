import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient, inviteClientUser } from "@/lib/clients";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  async function invite(formData: FormData) {
    "use server";
    const email = formData.get("email");
    if (typeof email !== "string" || !email.trim()) return;
    await inviteClientUser(id, { email });
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/admin"
        className="mb-6 inline-block text-sm text-zinc-500 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-50"
      >
        &larr; All clients
      </Link>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          {client.name}
        </h1>
        <Link
          href={`/admin/clients/${client.id}/onboarding`}
          className="h-10 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium leading-10 text-zinc-950 transition-colors hover:bg-zinc-950/5 dark:border-white/15 dark:text-zinc-50 dark:hover:bg-white/10"
        >
          Edit onboarding profile
        </Link>
      </div>

      <section className="mb-8 rounded-xl border border-zinc-950/10 p-5 dark:border-white/10">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Onboarding status
        </h2>
        <p className="text-sm text-zinc-950 dark:text-zinc-50">
          {client.voiceProfile
            ? "Voice profile captured."
            : "Voice profile not yet captured."}
        </p>
      </section>

      <section className="rounded-xl border border-zinc-950/10 p-5 dark:border-white/10">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Logins ({client.users.length})
        </h2>
        <ul className="mb-4 flex flex-col gap-1 text-sm text-zinc-950 dark:text-zinc-50">
          {client.users.map((user) => (
            <li key={user.id}>{user.email}</li>
          ))}
        </ul>
        <form action={invite} className="flex gap-2">
          <input
            type="email"
            name="email"
            required
            placeholder="client@example.com"
            className="h-10 flex-1 rounded-lg border border-zinc-950/10 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
          />
          <button
            type="submit"
            className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Invite
          </button>
        </form>
      </section>
    </main>
  );
}
