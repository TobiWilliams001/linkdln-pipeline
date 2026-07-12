import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { provisionClientForEmail } from "@/lib/clients";

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
    async session({ session, user }) {
      // `user` can be stale relative to a clientId update made moments
      // earlier (e.g. in the createUser event below), so re-fetch to make
      // sure the session always reflects the current row.
      const fresh = await db.user.findUnique({ where: { id: user.id } });
      session.user.role = fresh?.role ?? user.role;
      session.user.clientId = fresh?.clientId ?? user.clientId;
      return session;
    },
  },
  events: {
    // Fires once, right after the adapter persists a brand-new User row -
    // unlike the signIn callback, which runs BEFORE that row exists for a
    // first-time email (calling db.user.update there fails with "record
    // not found" since there's nothing to update yet).
    async createUser({ user }) {
      if (!user.email || !user.id) return;
      const client = await provisionClientForEmail(user.email);
      await db.user.update({
        where: { id: user.id },
        data: { clientId: client.id },
      });
    },
  },
});
