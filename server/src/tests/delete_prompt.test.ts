import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type DeletePromptInput, type CreatePromptInput } from '../schema';
import { deletePrompt } from '../handlers/delete_prompt';
import { eq } from 'drizzle-orm';

describe('deletePrompt', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  const createTestPrompt = async (text: string = 'Test prompt'): Promise<number> => {
    const testInput: CreatePromptInput = {
      text,
      description: 'A test prompt description',
      tags: ['test', 'sample']
    };

    const result = await db.insert(promptsTable)
      .values({
        text: testInput.text,
        description: testInput.description,
        tags: testInput.tags
      })
      .returning()
      .execute();

    return result[0].id;
  };

  it('should delete an existing prompt and return true', async () => {
    // Create a test prompt
    const promptId = await createTestPrompt();

    // Delete the prompt
    const deleteInput: DeletePromptInput = { id: promptId };
    const result = await deletePrompt(deleteInput);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify prompt no longer exists in database
    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId))
      .execute();

    expect(prompts).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent prompt', async () => {
    // Try to delete a prompt with an ID that doesn't exist
    const deleteInput: DeletePromptInput = { id: 99999 };
    const result = await deletePrompt(deleteInput);

    // Should return false since no rows were affected
    expect(result).toBe(false);
  });

  it('should not affect other prompts when deleting one', async () => {
    // Create multiple test prompts
    const promptId1 = await createTestPrompt('First prompt');
    const promptId2 = await createTestPrompt('Second prompt');
    const promptId3 = await createTestPrompt('Third prompt');

    // Delete the middle prompt
    const deleteInput: DeletePromptInput = { id: promptId2 };
    const result = await deletePrompt(deleteInput);

    // Verify deletion was successful
    expect(result).toBe(true);

    // Verify the deleted prompt is gone
    const deletedPrompt = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId2))
      .execute();
    expect(deletedPrompt).toHaveLength(0);

    // Verify other prompts still exist
    const remainingPrompts = await db.select()
      .from(promptsTable)
      .execute();
    expect(remainingPrompts).toHaveLength(2);

    // Verify specific prompts still exist
    const prompt1 = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId1))
      .execute();
    expect(prompt1).toHaveLength(1);

    const prompt3 = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId3))
      .execute();
    expect(prompt3).toHaveLength(1);
  });

  it('should handle deletion of prompt with null description', async () => {
    // Create a prompt with null description
    const result = await db.insert(promptsTable)
      .values({
        text: 'Prompt with null description',
        description: null,
        tags: ['minimal']
      })
      .returning()
      .execute();

    const promptId = result[0].id;

    // Delete the prompt
    const deleteInput: DeletePromptInput = { id: promptId };
    const deleteResult = await deletePrompt(deleteInput);

    // Verify deletion was successful
    expect(deleteResult).toBe(true);

    // Verify prompt no longer exists
    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId))
      .execute();
    expect(prompts).toHaveLength(0);
  });

  it('should handle deletion of prompt with empty tags array', async () => {
    // Create a prompt with empty tags
    const result = await db.insert(promptsTable)
      .values({
        text: 'Prompt with empty tags',
        description: 'Test description',
        tags: []
      })
      .returning()
      .execute();

    const promptId = result[0].id;

    // Delete the prompt
    const deleteInput: DeletePromptInput = { id: promptId };
    const deleteResult = await deletePrompt(deleteInput);

    // Verify deletion was successful
    expect(deleteResult).toBe(true);

    // Verify prompt no longer exists
    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, promptId))
      .execute();
    expect(prompts).toHaveLength(0);
  });
});