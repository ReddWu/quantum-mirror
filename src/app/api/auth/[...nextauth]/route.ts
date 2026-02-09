import NextAuth from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = (request: Request, context: unknown) =>
  NextAuth(getAuthOptions())(request, context as never);

export { handler as GET, handler as POST };
