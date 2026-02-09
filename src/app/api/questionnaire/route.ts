import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildFirstFutureMessage, parseAvoidPhrases } from "@/lib/questionnaire";
import { questionnaireSchema } from "@/lib/validators";

export async function GET() {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const questionnaire = await prisma.userQuestionnaire.findUnique({
    where: { userId: session.user.id },
  });

  if (!questionnaire) {
    return NextResponse.json({ completed: false, data: null }, { status: 200 });
  }

  return NextResponse.json(
    {
      completed: true,
      data: {
        personalization_agreed: questionnaire.personalizationAgreed,
        future_goal: {
          big_win: questionnaire.bigWin,
          target_year: questionnaire.targetYear,
          success_metric: questionnaire.successMetric,
        },
        voice_profile: {
          raw_sample: questionnaire.messageSample,
        },
        stress_profile: {
          primary_mode: questionnaire.stressPrimaryMode,
          secondary_mode: questionnaire.stressSecondaryMode || undefined,
          notes: questionnaire.stressNotes || undefined,
        },
        coaching_preference: {
          tone_axis: questionnaire.toneAxis,
          focus_axis: questionnaire.focusAxis,
        },
        boundaries: {
          avoid_phrases: parseAvoidPhrases(questionnaire.avoidPhrasesJson),
        },
      },
      completed_at: questionnaire.completedAt,
    },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(getAuthOptions());
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = questionnaireSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid payload",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  const payload = parsed.data;
  const cleanAvoidPhrases = (payload.boundaries?.avoid_phrases || []).map((value) => value.trim()).filter(Boolean);

  const saved = await prisma.userQuestionnaire.upsert({
    where: { userId: session.user.id },
    update: {
      personalizationAgreed: payload.personalization_agreed,
      bigWin: payload.future_goal.big_win,
      targetYear: payload.future_goal.target_year,
      successMetric: payload.future_goal.success_metric,
      messageSample: payload.voice_profile.raw_sample,
      stressPrimaryMode: payload.stress_profile.primary_mode,
      stressSecondaryMode: payload.stress_profile.secondary_mode || null,
      stressNotes: payload.stress_profile.notes || null,
      toneAxis: payload.coaching_preference.tone_axis,
      focusAxis: payload.coaching_preference.focus_axis,
      avoidPhrasesJson: cleanAvoidPhrases.length > 0 ? JSON.stringify(cleanAvoidPhrases) : null,
      completedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      personalizationAgreed: payload.personalization_agreed,
      bigWin: payload.future_goal.big_win,
      targetYear: payload.future_goal.target_year,
      successMetric: payload.future_goal.success_metric,
      messageSample: payload.voice_profile.raw_sample,
      stressPrimaryMode: payload.stress_profile.primary_mode,
      stressSecondaryMode: payload.stress_profile.secondary_mode || null,
      stressNotes: payload.stress_profile.notes || null,
      toneAxis: payload.coaching_preference.tone_axis,
      focusAxis: payload.coaching_preference.focus_axis,
      avoidPhrasesJson: cleanAvoidPhrases.length > 0 ? JSON.stringify(cleanAvoidPhrases) : null,
      completedAt: new Date(),
    },
  });

  return NextResponse.json(
    {
      completed: true,
      first_message: buildFirstFutureMessage(saved),
      data: {
        goal: saved.bigWin,
        target_year: saved.targetYear,
        success_metric: saved.successMetric,
        tone_axis: saved.toneAxis,
        focus_axis: saved.focusAxis,
      },
    },
    { status: 200 }
  );
}
