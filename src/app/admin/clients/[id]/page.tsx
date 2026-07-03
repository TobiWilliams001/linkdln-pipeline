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
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">{client.name}</h1>
        <Link
          href={`/admin/clients/${client.id}/onboarding`}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          Edit onboarding profile
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-gray-500">
          Onboarding status
        </h2>
        <p className="text-sm">
          {client.voiceProfile
            ? "Voice profile captured."
            : "Voice profile not yet captured."}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="mb-2 text-sm font-medium text-gray-500">
          Logins ({client.users.length})
        </h2>
        <ul className="mb-3 flex flex-col gap-1 text-sm">
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
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-black px-3 py-2 text-sm text-white"
          >
            Invite
          </button>
        </form>
      </section>
    </main>
  );
}
