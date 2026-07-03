import Link from "next/link";
import { listClients } from "@/lib/clients";

export default async function AdminHomePage() {
  const clients = await listClients();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clients</h1>
        <Link
          href="/admin/clients/new"
          className="rounded bg-black px-3 py-2 text-sm text-white"
        >
          New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <p className="text-sm text-gray-500">No clients yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {clients.map((client) => (
            <li key={client.id}>
              <Link
                href={`/admin/clients/${client.id}`}
                className="flex items-center justify-between rounded border border-gray-200 px-4 py-3 hover:bg-gray-50"
              >
                <span>{client.name}</span>
                <span className="text-xs text-gray-500">
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
