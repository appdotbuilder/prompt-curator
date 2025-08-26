import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type DeletePromptInput } from '../schema';
import { eq } from 'drizzle-orm';

export const deletePrompt = async (input: DeletePromptInput): Promise<boolean> => {
  try {
    // Delete the prompt by ID
    const result = await db.delete(promptsTable)
      .where(eq(promptsTable.id, input.id))
      .execute();

    // Check if any rows were affected (deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Prompt deletion failed:', error);
    throw error;
  }
};