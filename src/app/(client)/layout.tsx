import { requireClient } from "@/lib/authz";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireClient();
  return <div className="min-h-screen">{children}</div>;
}
