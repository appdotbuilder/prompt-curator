import { z } from 'zod';

// Prompt schema with proper validation
export const promptSchema = z.object({
  id: z.number(),
  text: z.string(),
  description: z.string().nullable(),
  tags: z.array(z.string()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Prompt = z.infer<typeof promptSchema>;

// Input schema for creating prompts
export const createPromptInputSchema = z.object({
  text: z.string().min(1, "Prompt text is required"),
  description: z.string().nullable(),
  tags: z.array(z.string()).default([])
});

export type CreatePromptInput = z.infer<typeof createPromptInputSchema>;

// Input schema for updating prompts
export const updatePromptInputSchema = z.object({
  id: z.number(),
  text: z.string().min(1, "Prompt text is required").optional(),
  description: z.string().nullable().optional(),
  tags: z.array(z.string()).optional()
});

export type UpdatePromptInput = z.infer<typeof updatePromptInputSchema>;

// Input schema for deleting prompts
export const deletePromptInputSchema = z.object({
  id: z.number()
});

export type DeletePromptInput = z.infer<typeof deletePromptInputSchema>;

// Input schema for getting a single prompt
export const getPromptInputSchema = z.object({
  id: z.number()
});

export type GetPromptInput = z.infer<typeof getPromptInputSchema>;