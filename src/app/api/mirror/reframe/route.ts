import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reframeSchema } from "@/lib/validators";
import { generateReframe } from "@/lib/gemini";
import { uploadImageFromUrl } from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = reframeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { session_id, goal, image_url, user_context_text } = parsed.data;

  let cloudUrl = image_url;
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    const upload = await uploadImageFromUrl(image_url);
    cloudUrl = upload.secure_url;
  }

  const ai = await generateReframe(
    cloudUrl,
    goal.title,
    user_context_text
  );

  await prisma.realityAnchor.create({
    data: {
      sessionId: session_id,
      imageUrl: cloudUrl,
      userContextText: user_context_text,
      aiFutureDeltasJson: JSON.stringify(ai.future_deltas),
      aiNarrationText: ai.narration,
    },
  });

  return NextResponse.json(ai);
}
