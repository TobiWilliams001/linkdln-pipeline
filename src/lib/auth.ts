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
    async signIn({ user }) {
      if (!user.email || !user.id) return false;
      // Open signup: the adapter already created a bare User row for any new
      // email. First sign-in, give them their own Client to fill in via the
      // self-serve onboarding form.
      if (!user.clientId) {
        const client = await provisionClientForEmail(user.email);
        await db.user.update({
          where: { id: user.id },
          data: { clientId: client.id },
        });
      }
      return true;
    },
    async session({ session, user }) {
      // `user` can be stale relative to the clientId update just made in
      // signIn, so re-fetch to make sure the session always has it.
      const fresh = await db.user.findUnique({ where: { id: user.id } });
      session.user.role = fresh?.role ?? user.role;
      session.user.clientId = fresh?.clientId ?? user.clientId;
      return session;
    },
  },
});
