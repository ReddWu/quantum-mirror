type QuestionnaireLike = {
  bigWin: string;
  targetYear: number;
  successMetric: string;
  messageSample: string;
  stressPrimaryMode: string;
  stressSecondaryMode: string | null;
  stressNotes: string | null;
  toneAxis: number;
  focusAxis: number;
  avoidPhrasesJson: string | null;
};

const stressModeLabel: Record<string, string> = {
  vent_reset: "vent first, then reset fast",
  quiet_process: "go quiet and process",
  joke_through_it: "joke through stress",
  reassurance_needed: "need reassurance before stabilizing",
};

function hasHighEnergySample(sample: string): boolean {
  return /[A-Z]{3,}/.test(sample) || /!{2,}/.test(sample) || /[\u{1F300}-\u{1FAFF}]/u.test(sample);
}

export function parseAvoidPhrases(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    }
  } catch {
    return [];
  }
  return [];
}

export function buildQuestionnaireContext(questionnaire: QuestionnaireLike): string {
  const avoidPhrases = parseAvoidPhrases(questionnaire.avoidPhrasesJson);
  const tone = questionnaire.toneAxis >= 66 ? "tough-love and direct" : questionnaire.toneAxis <= 33 ? "encouraging and warm" : "balanced";
  const focus = questionnaire.focusAxis >= 66 ? "strategy-first" : questionnaire.focusAxis <= 33 ? "emotion-first" : "balanced";
  const primary = stressModeLabel[questionnaire.stressPrimaryMode] || questionnaire.stressPrimaryMode;
  const secondary = questionnaire.stressSecondaryMode
    ? stressModeLabel[questionnaire.stressSecondaryMode] || questionnaire.stressSecondaryMode
    : "not provided";

  return [
    "Personalization profile:",
    `- Goal win: ${questionnaire.bigWin}`,
    `- Target year: ${questionnaire.targetYear}`,
    `- Success metric: ${questionnaire.successMetric}`,
    `- Voice sample: ${questionnaire.messageSample}`,
    `- Coaching tone: ${tone}`,
    `- Coaching focus: ${focus}`,
    `- Stress primary mode: ${primary}`,
    `- Stress secondary mode: ${secondary}`,
    `- Stress notes: ${questionnaire.stressNotes || "none"}`,
    `- Avoid phrases/topics: ${avoidPhrases.length > 0 ? avoidPhrases.join("; ") : "none"}`,
    "Mirror the user's style naturally, but do not caricature it.",
  ].join("\n");
}

export function buildFirstFutureMessage(questionnaire: QuestionnaireLike): string {
  const energetic = hasHighEnergySample(questionnaire.messageSample);
  const tough = questionnaire.toneAxis >= 66;
  const strategic = questionnaire.focusAxis >= 66;

  if (tough && strategic) {
    return `Listen. ${questionnaire.targetYear} is real if you execute cleanly. ${questionnaire.bigWin} only happened because you respected the plan. Today's move should directly improve: ${questionnaire.successMetric}.`;
  }

  if (energetic) {
    return `YOOO, quick sync from future-you. ${questionnaire.bigWin} is done, and it was worth every boring day. Lock in one step today that gets you closer to ${questionnaire.successMetric}.`;
  }

  return `I'm one possible future you, checking in. ${questionnaire.bigWin} became real through consistent daily reps. Let's make today count toward ${questionnaire.successMetric}.`;
}

export function buildStylePreview(toneAxis: number, focusAxis: number): string {
  const tone =
    toneAxis >= 75 ? "Tough" : toneAxis <= 25 ? "Hype" : toneAxis >= 55 ? "Balanced-Tough" : "Balanced-Hype";
  const focus = focusAxis >= 75 ? "Strategic" : focusAxis <= 25 ? "Supportive" : "Balanced";
  return `${focus} | Tone: ${tone}`;
}
