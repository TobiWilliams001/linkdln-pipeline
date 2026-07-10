import Link from "next/link";
import { listClients } from "@/lib/clients";

export default async function AdminHomePage() {
  const clients = await listClients();

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
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

      {clients.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No clients yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between rounded-xl border border-zinc-950/10 px-4 py-3.5 transition-colors hover:bg-zinc-950/2 dark:border-white/10 dark:hover:bg-white/3"
              >
                <span className="text-zinc-950 dark:text-zinc-50">
                  {client.name}
                </span>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  {client._count.weeklyInputs} weekly inputs -{" "}
                  {client._count.contentPosts} posts
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
