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

const stressModes = [
  "vent_reset",
  "quiet_process",
  "joke_through_it",
  "reassurance_needed",
] as const;

export const questionnaireSchema = z
  .object({
    personalization_agreed: z.literal(true),
    future_goal: z.object({
      big_win: z.string().min(5).max(240),
      target_year: z.number().int().min(2025).max(2100),
      success_metric: z.string().min(3).max(240),
    }),
    voice_profile: z.object({
      raw_sample: z.string().min(5).max(500),
    }),
    stress_profile: z.object({
      primary_mode: z.enum(stressModes),
      secondary_mode: z.enum(stressModes).optional(),
      notes: z.string().max(240).optional(),
    }),
    coaching_preference: z.object({
      tone_axis: z.number().int().min(0).max(100),
      focus_axis: z.number().int().min(0).max(100),
    }),
    boundaries: z
      .object({
        avoid_phrases: z.array(z.string().min(1).max(120)).max(10).optional(),
      })
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.stress_profile.secondary_mode && data.stress_profile.secondary_mode === data.stress_profile.primary_mode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Secondary mode must be different from primary mode",
        path: ["stress_profile", "secondary_mode"],
      });
    }
  });

export type QuestionnaireInput = z.infer<typeof questionnaireSchema>;
