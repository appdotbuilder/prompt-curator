import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type GetPromptInput, type Prompt } from '../schema';
import { eq } from 'drizzle-orm';

export async function getPrompt(input: GetPromptInput): Promise<Prompt | null> {
  try {
    // Query the database for the prompt with the given ID
    const results = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, input.id))
      .execute();

    // Return null if no prompt found
    if (results.length === 0) {
      return null;
    }

    // Return the first (and should be only) result
    const prompt = results[0];
    return {
      ...prompt,
      // Ensure dates are properly typed as Date objects
      created_at: prompt.created_at,
      updated_at: prompt.updated_at
    };
  } catch (error) {
    console.error('Get prompt failed:', error);
    throw error;
  }
}