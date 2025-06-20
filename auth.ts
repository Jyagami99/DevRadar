import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        token.username = profile.login;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export async function auth() {
  return await NextAuth(authOptions).auth();
}
