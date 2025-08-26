import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type CreatePromptInput, type Prompt } from '../schema';

export const createPrompt = async (input: CreatePromptInput): Promise<Prompt> => {
  try {
    // Insert prompt record
    const result = await db.insert(promptsTable)
      .values({
        text: input.text,
        description: input.description,
        tags: input.tags // JSON array is handled directly by Drizzle
      })
      .returning()
      .execute();

    // Return the created prompt
    const prompt = result[0];
    return {
      ...prompt,
      tags: prompt.tags as string[] // Ensure proper typing for JSON field
    };
  } catch (error) {
    console.error('Prompt creation failed:', error);
    throw error;
  }
};