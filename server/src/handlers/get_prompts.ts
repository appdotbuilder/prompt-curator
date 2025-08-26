import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type Prompt } from '../schema';

export const getPrompts = async (): Promise<Prompt[]> => {
  try {
    // Select all prompts from the database
    const results = await db.select()
      .from(promptsTable)
      .execute();

    // Return the results directly since no numeric conversions are needed
    // The JSON tags field and other fields are already in the correct format
    return results;
  } catch (error) {
    console.error('Failed to fetch prompts:', error);
    throw error;
  }
};