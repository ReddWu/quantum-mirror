import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { actionCheckinSchema } from "@/lib/validators";
import { generateCheckinFeedback } from "@/lib/gemini";
import { uploadImageFromUrl } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = actionCheckinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { action_task_id, photo_url, reflection_text, goal, session_context_summary } =
    parsed.data;

  let cloudUrl = photo_url;
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const upload = await uploadImageFromUrl(photo_url);
    cloudUrl = upload.secure_url;
  }

  const summary = [
    `Goal:${goal.title}`,
    `Reflection:${reflection_text || "none"}`,
    `Session context:${session_context_summary || "none"}`,
  ].join(" | ");

  const ai = await generateCheckinFeedback(summary);
  const checkin = await prisma.actionCheckin.create({
    data: {
      actionTaskId: action_task_id,
      photoUrl: cloudUrl,
      reflectionText: reflection_text,
      aiFeedbackText: `${ai.feedback}\nSustainment:${ai.one_small_sustainment}\nTomorrow:${ai.next_prompt}`,
    },
  });

  await prisma.actionTask.update({
    where: { id: action_task_id },
    data: { completedAt: new Date() },
  });

  return NextResponse.json({ ...ai, checkin_id: checkin.id });
}
