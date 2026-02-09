import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionGenerateSchema } from "@/lib/validators";
import { generateActionTask } from "@/lib/gemini";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = actionGenerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { session_id, context, goal } = parsed.data;
  const summary = [
    `目标:${goal.title}`,
    `聊天摘要:${context.chat_summary}`,
    `差异:${JSON.stringify(context.future_deltas || [])}`,
    `约束:${JSON.stringify(context.constraints || {})}`,
  ].join(" | ");

  const ai = await generateActionTask(summary);
  const task = await prisma.actionTask.create({
    data: {
      sessionId: session_id,
      title: ai.action_task.title,
      instructionsJson: JSON.stringify(ai.action_task.instructions),
      rationale: ai.action_task.rationale,
      estimatedMinutes: ai.action_task.estimated_minutes,
      requiresPhoto: true,
    },
  });

  return NextResponse.json({ action_task: { ...ai.action_task, id: task.id } });
}

