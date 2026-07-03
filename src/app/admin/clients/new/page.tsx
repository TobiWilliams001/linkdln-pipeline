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
    <main className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold">New client</h1>
      <form action={create} className="flex flex-col gap-3">
        <input
          type="text"
          name="name"
          required
          placeholder="Client name"
          className="rounded border border-gray-300 px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          Create and start onboarding
        </button>
      </form>
    </main>
  );
}
