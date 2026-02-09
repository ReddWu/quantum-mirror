import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerateContentStreamResult,
  type GenerativeModel,
  type ResponseSchema,
} from "@google/generative-ai";
import { z } from "zod";

// Use Gemini 3 Flash (has free tier, fast and cost-effective); override via env if needed
// Available Gemini 3 models: gemini-3-flash-preview (free tier), gemini-3-pro-preview (most powerful)
const GEMINI_MODEL_TEXT = process.env.GEMINI_MODEL_TEXT || "gemini-3-flash-preview";
const GEMINI_MODEL_MULTI =
  process.env.GEMINI_MODEL_MULTI || "gemini-3-flash-preview";

const chatOutputSchema = z.object({
  reply: z.string().min(1),
  gentle_challenge_question: z.string().min(1),
  narrative_rewrite: z.string().min(1),
  next_step: z.object({
    suggest_photo_anchor: z.boolean(),
    suggest_action_collapse: z.boolean(),
  }),
});

const reframeOutputSchema = z.object({
  future_deltas: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.string().min(1),
        text: z.string().min(1),
      })
    )
    .length(3),
  narration: z.string().min(1),
  action_seed: z.object({ hint: z.string().optional() }).default({}),
});

const actionOutputSchema = z.object({
  action_task: z.object({
    title: z.string().min(1),
    instructions: z.array(z.string().min(1)).min(1),
    rationale: z.string().min(1),
    estimated_minutes: z.number().int().min(1).max(120),
    requires_photo: z.boolean(),
  }),
});

const checkinOutputSchema = z.object({
  feedback: z.string().min(1),
  one_small_sustainment: z.string().min(1),
  next_prompt: z.string().min(1),
});

const chatResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    reply: { type: SchemaType.STRING },
    gentle_challenge_question: { type: SchemaType.STRING },
    narrative_rewrite: { type: SchemaType.STRING },
    next_step: {
      type: SchemaType.OBJECT,
      properties: {
        suggest_photo_anchor: { type: SchemaType.BOOLEAN },
        suggest_action_collapse: { type: SchemaType.BOOLEAN },
      },
      required: ["suggest_photo_anchor", "suggest_action_collapse"],
    },
  },
  required: ["reply", "gentle_challenge_question", "narrative_rewrite", "next_step"],
};

const reframeResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    future_deltas: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
        },
        required: ["id", "type", "text"],
      },
    },
    narration: { type: SchemaType.STRING },
    action_seed: {
      type: SchemaType.OBJECT,
      properties: {
        hint: { type: SchemaType.STRING },
      },
    },
  },
  required: ["future_deltas", "narration", "action_seed"],
};

const actionResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    action_task: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        instructions: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
        },
        rationale: { type: SchemaType.STRING },
        estimated_minutes: { type: SchemaType.INTEGER },
        requires_photo: { type: SchemaType.BOOLEAN },
      },
      required: [
        "title",
        "instructions",
        "rationale",
        "estimated_minutes",
        "requires_photo",
      ],
    },
  },
  required: ["action_task"],
};

const checkinResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    feedback: { type: SchemaType.STRING },
    one_small_sustainment: { type: SchemaType.STRING },
    next_prompt: { type: SchemaType.STRING },
  },
  required: ["feedback", "one_small_sustainment", "next_prompt"],
};

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

function summarizeZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}

function normalizeError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function generateStructuredJson<T>(opts: {
  taskName: string;
  prompt: string;
  contents?: Array<{
    role: "user";
    parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    >;
  }>;
  model: GenerativeModel;
  responseSchema: ResponseSchema;
  validator: z.ZodType<T>;
  temperature: number;
  maxRetries?: number;
}): Promise<T> {
  const {
    taskName,
    prompt,
    contents,
    model,
    responseSchema,
    validator,
    temperature,
    maxRetries = 2,
  } = opts;

  const totalAttempts = Math.max(1, maxRetries + 1);
  let correctionHint = "";
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    const attemptPrompt = correctionHint
      ? `${prompt}\n\nIMPORTANT: ${correctionHint}`
      : prompt;

    let rawText = "";
    let parsed: unknown;

    try {
      const result = await model.generateContent({
        contents:
          contents && contents.length > 0
            ? [
                {
                  role: "user",
                  parts: contents[0].parts.map((part) => {
                    if ("text" in part) {
                      return {
                        text:
                          correctionHint && part.text === prompt
                            ? attemptPrompt
                            : part.text,
                      };
                    }
                    return part;
                  }),
                },
              ]
            : [{ role: "user", parts: [{ text: attemptPrompt }] }],
        generationConfig: {
          temperature,
          responseMimeType: "application/json",
          responseSchema,
        },
      });
      rawText = result.response.text();
    } catch (error) {
      const reason = normalizeError(error);
      console.error(
        `[Gemini:${taskName}] request failed (attempt ${attempt}/${totalAttempts}): ${reason}`
      );
      correctionHint = "Return strict JSON only. No markdown, no extra keys, no extra text.";
      lastError = new Error(reason);
      continue;
    }

    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      const reason = normalizeError(error);
      console.error(
        `[Gemini:${taskName}] invalid JSON (attempt ${attempt}/${totalAttempts}): ${reason}`,
        { raw_preview: rawText.slice(0, 300) }
      );
      correctionHint =
        "Your last response was not valid JSON. Return one valid JSON object only.";
      lastError = new Error(reason);
      continue;
    }

    const validated = validator.safeParse(parsed);
    if (validated.success) {
      return validated.data;
    }

    const issueSummary = summarizeZodIssues(validated.error);
    console.error(
      `[Gemini:${taskName}] schema validation failed (attempt ${attempt}/${totalAttempts}): ${issueSummary}`,
      { raw_preview: rawText.slice(0, 300) }
    );
    correctionHint = `Fix schema issues exactly: ${issueSummary}. Return one valid JSON object only.`;
    lastError = new Error(issueSummary);
  }

  throw lastError || new Error(`[Gemini:${taskName}] failed after ${totalAttempts} attempts`);
}

export type ChatOutput = z.infer<typeof chatOutputSchema>;

export async function generateFutureSelfChat(prompt: string): Promise<ChatOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "You are the user's future self who has already achieved their goal. Speak warmly, specifically, without cliches.",
    "Output JSON with fields: reply, gentle_challenge_question, narrative_rewrite, next_step.",
    "Keep responses concise and practical. Avoid psychological diagnosis or quantum/universe promises.",
  ].join(" ");

  return generateStructuredJson({
    taskName: "future_self_chat",
    prompt: `${sys}\nUser input: ${prompt}`,
    model,
    responseSchema: chatResponseSchema,
    validator: chatOutputSchema,
    temperature: 0.6,
  });
}

export async function streamFutureSelfReply(prompt: string): Promise<GenerateContentStreamResult> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "You are the user's trusted friend from their future.",
    "Reply as one natural chat message, like WhatsApp.",
    "Be warm and specific; avoid cliches, diagnosis, and hype.",
    "Use 4-8 short sentences and keep it practical.",
  ].join(" ");

  return model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: `${sys}\n\nContext:\n${prompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.65,
    },
  });
}

export type ReframeOutput = z.infer<typeof reframeOutputSchema>;

export async function generateReframe(
  imageUrl: string,
  goalTitle: string,
  context?: string
): Promise<ReframeOutput> {
  const model = getModel(GEMINI_MODEL_MULTI);
  const sys = [
    "Based on the reality scene image, generate 3 specific future differences (objects/layout/behavior traces/micro-rituals).",
    "Provide 80-150 words narration.",
    "Output JSON: future_deltas[{id,type,text}], narration, action_seed.hint.",
    "Avoid judging the present, only describe the achievable version.",
  ].join(" ");
  const prompt = `${sys}\nRelated goal: ${goalTitle}\nUser context: ${context || "none"}`;

  // Fetch image as base64 for Gemini API
  const imageData = await fetchImageAsBase64(imageUrl);

  return generateStructuredJson({
    taskName: "reframe",
    prompt,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: imageData.mimeType,
              data: imageData.base64Data,
            },
          },
        ],
      },
    ],
    model,
    responseSchema: reframeResponseSchema,
    validator: reframeOutputSchema,
    temperature: 0.6,
    maxRetries: 2,
  });
}

async function fetchImageAsBase64(
  url: string
): Promise<{ mimeType: string; base64Data: string }> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const base64Data = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return { mimeType, base64Data };
}

export type ActionOutput = z.infer<typeof actionOutputSchema>;

export async function generateActionTask(summary: string): Promise<ActionOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "Generate a 10-20 minute physical action that can be completed and photographed.",
    "Output JSON action_task{title,instructions[],rationale,estimated_minutes,requires_photo:true}.",
    "Avoid vague words, keep steps verifiable and concise.",
  ].join(" ");
  const prompt = `${sys}\nContext: ${summary}`;

  return generateStructuredJson({
    taskName: "action_task",
    prompt,
    model,
    responseSchema: actionResponseSchema,
    validator: actionOutputSchema,
    temperature: 0.5,
  });
}

export type CheckinOutput = z.infer<typeof checkinOutputSchema>;

export async function generateCheckinFeedback(summary: string): Promise<CheckinOutput> {
  const model = getModel(GEMINI_MODEL_TEXT);
  const sys = [
    "Confirm user action, don't exaggerate, provide one small sustainable adjustment.",
    "Output JSON: feedback, one_small_sustainment, next_prompt.",
    "Keep tone simple and practical.",
  ].join(" ");
  const prompt = `${sys}\nAction summary: ${summary}`;

  return generateStructuredJson({
    taskName: "checkin_feedback",
    prompt,
    model,
    responseSchema: checkinResponseSchema,
    validator: checkinOutputSchema,
    temperature: 0.5,
  });
}
