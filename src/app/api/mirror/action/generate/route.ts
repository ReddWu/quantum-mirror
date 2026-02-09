import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionGenerateSchema } from "@/lib/validators";
import { generateActionTask } from "@/lib/gemini";

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions());
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
    `Goal:${goal.title}`,
    `Chat summary:${context.chat_summary}`,
    `Future deltas:${JSON.stringify(context.future_deltas || [])}`,
    `Constraints:${JSON.stringify(context.constraints || {})}`,
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
