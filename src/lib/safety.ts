const SELF_HARM_KEYWORDS = [
  "suicide",
  "kill myself",
  "hurt myself",
  "end my life",
  "don't want to live",
  "want to die",
  "self harm",
];

export function hasSelfHarmRisk(text: string): boolean {
  const lower = text.toLowerCase();
  return SELF_HARM_KEYWORDS.some((k) => lower.includes(k.toLowerCase()));
}

export const SAFETY_NOTICE =
  "Safety notice: If you have thoughts of self-harm or extreme emotions, please immediately contact your local emergency helpline or a trusted person. This tool is for reflection and action planning only, not medical or psychological therapy.";

