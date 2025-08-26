import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type UpdatePromptInput, type Prompt } from '../schema';
import { eq } from 'drizzle-orm';

export async function updatePrompt(input: UpdatePromptInput): Promise<Prompt | null> {
  try {
    // Build the update object with only provided fields
    const updateData: Partial<typeof promptsTable.$inferInsert> = {
      updated_at: new Date() // Always update the timestamp
    };

    if (input.text !== undefined) {
      updateData.text = input.text;
    }

    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    if (input.image_url !== undefined) {
      updateData.image_url = input.image_url;
    }

    if (input.tags !== undefined) {
      updateData.tags = input.tags;
    }

    // Update the prompt record
    const result = await db.update(promptsTable)
      .set(updateData)
      .where(eq(promptsTable.id, input.id))
      .returning()
      .execute();

    // Return the updated prompt or null if not found
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Prompt update failed:', error);
    throw error;
  }
}