import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatISO9075 } from "date-fns";

function todayKey() {
  return formatISO9075(new Date(), { representation: "date" });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const dateKey = todayKey();
  const existing = await prisma.session.findFirst({
    where: { userId: session.user.id, dateKey },
    include: { goal: true },
  });
  if (!existing) {
    return NextResponse.json({ exists: false }, { status: 200 });
  }
  return NextResponse.json({ exists: true, session: existing });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { goalId } = await req.json();
  if (!goalId) {
    return NextResponse.json({ error: "goalId required" }, { status: 400 });
  }
  const dateKey = todayKey();
  const existing = await prisma.session.findFirst({
    where: { userId: session.user.id, dateKey },
    include: { goal: true },
  });
  if (existing) {
    return NextResponse.json({ session: existing });
  }
  const newSession = await prisma.session.create({
    data: {
      userId: session.user.id,
      goalId,
      dateKey,
      status: "started",
    },
    include: { goal: true },
  });
  return NextResponse.json({ session: newSession });
}
