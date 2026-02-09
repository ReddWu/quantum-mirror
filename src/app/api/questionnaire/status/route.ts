import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questionnaire = await prisma.userQuestionnaire.findUnique({
    where: { userId: session.user.id },
    select: { id: true, completedAt: true },
  });

  return NextResponse.json(
    {
      completed: Boolean(questionnaire?.id),
      completed_at: questionnaire?.completedAt || null,
    },
    { status: 200 }
  );
}
