import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatSchema } from "@/lib/validators";
import { generateFutureSelfChat } from "@/lib/gemini";
import { hasSelfHarmRisk, SAFETY_NOTICE } from "@/lib/safety";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { session_id, user_message, goal } = parsed.data;

  if (hasSelfHarmRisk(user_message)) {
    return NextResponse.json(
      { safe_block: true, message: SAFETY_NOTICE },
      { status: 200 }
    );
  }

  const ai = await generateFutureSelfChat(
    `目标:${goal.title}\n描述:${goal.description || "无"}\n用户:${user_message}`
  );

  await prisma.chatMessage.createMany({
    data: [
      {
        sessionId: session_id,
        role: "user",
        content: user_message,
      },
      {
        sessionId: session_id,
        role: "assistant",
        content: JSON.stringify(ai),
      },
    ],
  });

  return NextResponse.json(ai);
}

