import { z } from "zod";

export const chatSchema = z.object({
  session_id: z.string(),
  goal: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  user_message: z.string().min(1),
  user_mood: z.string().optional(),
  conversation_history: z
    .array(z.object({ role: z.string(), content: z.string() }))
    .optional(),
});

export const reframeSchema = z.object({
  session_id: z.string(),
  goal: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  image_url: z.string().url(),
  user_context_text: z.string().optional(),
});

export const actionGenerateSchema = z.object({
  session_id: z.string(),
  goal: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  context: z.object({
    chat_summary: z.string(),
    future_deltas: z.array(z.any()).optional(),
    constraints: z
      .object({
        max_minutes: z.number().optional(),
        budget: z.enum(["free", "low", "any"]).optional(),
      })
      .optional(),
  }),
});

export const actionCheckinSchema = z.object({
  action_task_id: z.string(),
  photo_url: z.string().url(),
  reflection_text: z.string().optional(),
  goal: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
  session_context_summary: z.string().optional(),
});

export const goalCreateSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
});

