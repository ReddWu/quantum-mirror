import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatSchema } from "@/lib/validators";
import { streamFutureSelfReply } from "@/lib/gemini";
import { hasSelfHarmRisk, SAFETY_NOTICE } from "@/lib/safety";
import { buildQuestionnaireContext } from "@/lib/questionnaire";

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { session_id, user_message, goal } = parsed.data;

  const questionnaire = await prisma.userQuestionnaire.findUnique({
    where: { userId: session.user.id },
  });

  if (!questionnaire) {
    return NextResponse.json(
      { error: "Questionnaire is required before chat." },
      { status: 403 }
    );
  }

  if (hasSelfHarmRisk(user_message)) {
    return NextResponse.json(
      { safe_block: true, message: SAFETY_NOTICE },
      { status: 200 }
    );
  }

  const prompt = [
    `Goal:${goal.title}`,
    `Description:${goal.description || "none"}`,
    buildQuestionnaireContext(questionnaire),
    `User:${user_message}`,
  ].join("\n");
  const encoder = new TextEncoder();
  let streamResult;
  try {
    streamResult = await streamFutureSelfReply(prompt);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : String(error);
    console.error("[MirrorChat] Failed to initialize stream", {
      session_id,
      user_id: session.user.id,
      error: errorMessage,
    });
    return NextResponse.json(
      { error: "Failed to start assistant stream" },
      { status: 500 }
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, payload: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      let fullReply = "";
      let streamTextCursor = "";

      try {
        sendEvent("start", { ok: true });

        for await (const chunk of streamResult.stream) {
          const text = chunk.text();
          if (!text) continue;

          let delta = text;
          if (text.startsWith(streamTextCursor)) {
            delta = text.slice(streamTextCursor.length);
            streamTextCursor = text;
          } else {
            streamTextCursor += text;
          }

          if (!delta) continue;
          fullReply += delta;
          sendEvent("delta", { text: delta });
        }

        const assistantReply = fullReply.trim();
        if (!assistantReply) {
          console.error("[MirrorChat] Empty streamed response", {
            session_id,
            user_id: session.user.id,
          });
          sendEvent("error", { message: "Empty model response" });
          return;
        }

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
              content: assistantReply,
            },
          ],
        });

        sendEvent("done", { reply: assistantReply });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("[MirrorChat] Streaming failed", {
          session_id,
          user_id: session.user.id,
          error: errorMessage,
        });
        sendEvent("error", { message: "Failed to stream assistant reply" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
