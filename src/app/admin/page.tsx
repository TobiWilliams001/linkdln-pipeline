import Link from "next/link";
import { listClients } from "@/lib/clients";

export default async function AdminHomePage() {
  const clients = await listClients();

  return (
    <main className="mx-auto max-w-4xl px-10 py-12">
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          Clients
        </h1>
        <Link
          href="/admin/clients/new"
          className="h-10 rounded-lg bg-zinc-950 px-4 text-sm font-semibold leading-10 text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          New client
        </Link>
      </div>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        {clients.length} client{clients.length === 1 ? "" : "s"}
      </p>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-950/15 px-6 py-16 text-center dark:border-white/15">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No clients yet. Create one to start onboarding.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-950/10 dark:border-white/10">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-950/10 bg-zinc-950/2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:border-white/10 dark:bg-white/3 dark:text-zinc-400">
                <th className="px-5 py-3 font-semibold">Client</th>
                <th className="px-5 py-3 font-semibold">Onboarding</th>
                <th className="px-5 py-3 font-semibold">Logins</th>
                <th className="px-5 py-3 font-semibold">Weekly inputs</th>
                <th className="px-5 py-3 font-semibold">Posts</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-zinc-950/10 last:border-0 hover:bg-zinc-950/2 dark:border-white/10 dark:hover:bg-white/3"
                >
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-zinc-950 hover:underline dark:text-zinc-50"
                    >
                      {client.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    {client.voiceProfile ? (
                      <span className="rounded-full bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                        Complete
                      </span>
                    ) : (
                      <span className="rounded-full bg-zinc-950/5 px-2.5 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-400">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client._count.users}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client._count.weeklyInputs}
                  </td>
                  <td className="px-5 py-4 text-zinc-600 dark:text-zinc-400">
                    {client._count.contentPosts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
