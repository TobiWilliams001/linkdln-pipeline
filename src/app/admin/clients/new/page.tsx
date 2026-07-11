import { redirect } from "next/navigation";
import { createClient } from "@/lib/clients";

export default function NewClientPage() {
  async function create(formData: FormData) {
    "use server";
    const name = formData.get("name");
    if (typeof name !== "string" || !name.trim()) return;
    const client = await createClient({ name });
    redirect(`/admin/clients/${client.id}/onboarding`);
  }

  return (
    <main className="mx-auto max-w-sm px-10 py-12">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
        New client
      </h1>
      <form action={create} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="Client name"
          className="h-11 rounded-lg border border-zinc-950/10 bg-transparent px-3 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-zinc-950/30 dark:border-white/15 dark:text-zinc-50 dark:focus:border-white/30"
        />
        <button
          type="submit"
          className="h-11 rounded-lg bg-zinc-950 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          Create and start onboarding
        </button>
      </form>
    </main>
  );
}
