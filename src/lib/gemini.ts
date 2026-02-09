import {
  GoogleGenerativeAI,
  type GenerativeModel,
} from "@google/generative-ai";

// Use Gemini 3 Flash (has free tier, fast and cost-effective); override via env if needed
// Available Gemini 3 models: gemini-3-flash-preview (free tier), gemini-3-pro-preview (most powerful)
const GEMINI_MODEL_TEXT = process.env.GEMINI_MODEL_TEXT || "gemini-3-flash-preview";
const GEMINI_MODEL_MULTI =
  process.env.GEMINI_MODEL_MULTI || "gemini-3-flash-preview";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

function getModel(model: string): GenerativeModel {
  return getClient().getGenerativeModel({ model });
}

type ChatOutput = {
  reply: string;
  gentle_challenge_question: string;
  narrative_rewrite: string;
  next_step: {
    suggest_photo_anchor: boolean;
    suggest_action_collapse: boolean;
  };
};

export async function generateFutureSelfChat(prompt: string): Promise<ChatOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "You are the user's future self who has already achieved their goal. Speak warmly, specifically, without clichés.",
    "Output JSON with fields: reply, gentle_challenge_question, narrative_rewrite, next_step",
    "Keep responses 120-250 words. Avoid psychological diagnosis or quantum/universe promises.",
  ].join(" ");
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: `${sys}\nUser input: ${prompt}` }] }],
    generationConfig: { 
      temperature: 0.6,
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(result.response.text()) as ChatOutput;
}

type ReframeOutput = {
  future_deltas: Array<{ id: string; type: string; text: string }>;
  narration: string;
  action_seed: { hint?: string };
};

export async function generateReframe(
  imageUrl: string,
  goalTitle: string,
  context?: string
): Promise<ReframeOutput> {
  const model = getModel(GEMINI_MODEL_MULTI);
  const sys = [
    "Based on the reality scene image, generate 3 specific future differences (objects/layout/behavior traces/micro-rituals).",
    "Provide 80-150 words narration.",
    "Output JSON: future_deltas[{id,type,text}], narration, action_seed.hint",
    "Avoid judging the present, only describe the achievable version.",
  ].join(" ");
  const prompt = `${sys}\nRelated goal: ${goalTitle}\nUser context: ${context || "none"}`;

  // Fetch image as base64 for Gemini API
  const imageData = await fetchImageAsBase64(imageUrl);

  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64Data
          }
        }
      ]
    }],
    generationConfig: { 
      temperature: 0.6,
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(result.response.text()) as ReframeOutput;
}

async function fetchImageAsBase64(url: string): Promise<{ mimeType: string; base64Data: string }> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString('base64');
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  return { mimeType, base64Data };
}

type ActionOutput = {
  action_task: {
    title: string;
    instructions: string[];
    rationale: string;
    estimated_minutes: number;
    requires_photo: boolean;
  };
};

export async function generateActionTask(
  summary: string
): Promise<ActionOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "Generate a 10-20 minute physical action that can be completed and photographed.",
    "Output JSON action_task{title,instructions[],rationale,estimated_minutes,requires_photo:true}",
    "Avoid vague words, keep steps verifiable and concise.",
  ].join(" ");
  const prompt = `${sys}\nContext: ${summary}`;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(result.response.text()) as ActionOutput;
}

type CheckinOutput = {
  feedback: string;
  one_small_sustainment: string;
  next_prompt: string;
};

export async function generateCheckinFeedback(
  summary: string
): Promise<CheckinOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "Confirm user action, don't exaggerate, provide one small sustainable adjustment.",
    "Output JSON: feedback, one_small_sustainment, next_prompt",
    "120-200 words, keep tone simple.",
  ].join(" ");
  const prompt = `${sys}\nAction summary: ${summary}`;
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { 
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  });
  return JSON.parse(result.response.text()) as CheckinOutput;
}

