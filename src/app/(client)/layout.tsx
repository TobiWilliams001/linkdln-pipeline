import Link from "next/link";
import { requireClient } from "@/lib/authz";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();
  return (
    <div className="min-h-screen">
      <nav className="border-b border-gray-200 px-4 py-3">
        <div className="mx-auto flex max-w-2xl gap-4 text-sm">
          <Link href="/input">This week&apos;s input</Link>
          <Link href="/drafts">Drafts</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      </nav>
      {children}
    </div>
  );
}
