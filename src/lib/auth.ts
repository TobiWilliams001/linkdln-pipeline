import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "database" },
  trustHost: true,
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify",
  },
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.RESEND_FROM_EMAIL,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      // No self-serve signup: only emails already provisioned by an admin
      // (the seeded admin, or a client the admin has invited) may sign in.
      const existing = await db.user.findUnique({ where: { email: user.email } });
      return existing !== null;
    },
    session({ session, user }) {
      session.user.role = user.role;
      session.user.clientId = user.clientId;
      return session;
    },
  },
});
