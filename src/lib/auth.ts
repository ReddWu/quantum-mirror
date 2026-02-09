import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  EMAIL_SERVER,
  EMAIL_FROM,
  AUTH_SECRET,
} = process.env;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Changed to JWT for dev mode credentials
  secret: AUTH_SECRET,
  providers: [
    // Dev mode: simple credentials login (no password required)
    CredentialsProvider({
      id: "dev-login",
      name: "Dev Mode",
      credentials: {
        name: { label: "Name", type: "text", placeholder: "Enter any name" },
      },
      async authorize(credentials) {
        if (!credentials?.name) return null;
        
        // Find or create user in dev mode
        let user = await prisma.user.findFirst({
          where: { email: `${credentials.name.toLowerCase().replace(/\s+/g, '')}@dev.local` },
        });
        
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: credentials.name,
              email: `${credentials.name.toLowerCase().replace(/\s+/g, '')}@dev.local`,
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
    GOOGLE_CLIENT_ID &&
      GOOGLE_CLIENT_SECRET &&
      GoogleProvider({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
      }),
    EMAIL_SERVER &&
      EMAIL_FROM &&
      EmailProvider({
        server: EMAIL_SERVER,
        from: EMAIL_FROM,
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

