import type { Role } from "@/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      role: Role;
      clientId: string | null;
    };
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    role: Role;
    clientId: string | null;
  }
}
