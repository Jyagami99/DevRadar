import "next-auth";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      bio?: string;
    } & DefaultSession["user"];
  }

  interface Profile {
    login: string;
  }

  interface JWT {
    username?: string;
  }
}
