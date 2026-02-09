import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

export function getAuthOptions(): NextAuthOptions {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const emailServer = process.env.EMAIL_SERVER;
  const emailFrom = process.env.EMAIL_FROM;
  // Support both local AUTH_SECRET and NEXTAUTH_SECRET used by hosting platforms.
  const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;

  return {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" },
    secret: authSecret,
    providers: [
      CredentialsProvider({
        id: "dev-login",
        name: "Dev Mode",
        credentials: {
          name: { label: "Name", type: "text", placeholder: "Enter any name" },
        },
        async authorize(credentials) {
          if (!credentials?.name) return null;

          const normalizedName = credentials.name.toLowerCase().replace(/\s+/g, "");
          const email = `${normalizedName}@dev.local`;

          let user = await prisma.user.findFirst({
            where: { email },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                name: credentials.name,
                email,
              },
            });
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
          };
        },
      }),
      googleClientId &&
        googleClientSecret &&
        GoogleProvider({
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        }),
      emailServer &&
        emailFrom &&
        EmailProvider({
          server: emailServer,
          from: emailFrom,
        }),
    ].filter(Boolean) as NextAuthOptions["providers"],
    pages: {
      signIn: "/auth/signin",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
        }
        return session;
      },
    },
  };
}
