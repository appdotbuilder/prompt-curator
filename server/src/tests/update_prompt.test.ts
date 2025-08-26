import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type UpdatePromptInput } from '../schema';
import { updatePrompt } from '../handlers/update_prompt';
import { eq } from 'drizzle-orm';

describe('updatePrompt', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  // Helper function to create a test prompt
  async function createTestPrompt() {
    const result = await db.insert(promptsTable)
      .values({
        text: 'Original prompt text',
        description: 'Original description',
        tags: ['tag1', 'tag2']
      })
      .returning()
      .execute();
    return result[0];
  }

  it('should update prompt text only', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      text: 'Updated prompt text'
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Updated prompt text');
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.tags).toEqual(['tag1', 'tag2']); // Unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testPrompt.updated_at.getTime());
  });

  it('should update prompt description only', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      description: 'Updated description'
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Original prompt text'); // Unchanged
    expect(result!.description).toEqual('Updated description');
    expect(result!.tags).toEqual(['tag1', 'tag2']); // Unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testPrompt.updated_at.getTime());
  });

  it('should update prompt tags only', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      tags: ['newTag1', 'newTag2', 'newTag3']
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Original prompt text'); // Unchanged
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.tags).toEqual(['newTag1', 'newTag2', 'newTag3']);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testPrompt.updated_at.getTime());
  });

  it('should update multiple fields at once', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      text: 'Updated text',
      description: 'Updated description',
      tags: ['updatedTag']
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Updated text');
    expect(result!.description).toEqual('Updated description');
    expect(result!.tags).toEqual(['updatedTag']);
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(testPrompt.updated_at.getTime());
  });

  it('should set description to null', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      description: null
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Original prompt text'); // Unchanged
    expect(result!.description).toBeNull();
    expect(result!.tags).toEqual(['tag1', 'tag2']); // Unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update tags to empty array', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      tags: []
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Original prompt text'); // Unchanged
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.tags).toEqual([]);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent prompt', async () => {
    const updateInput: UpdatePromptInput = {
      id: 99999, // Non-existent ID
      text: 'Updated text'
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeNull();
  });

  it('should save changes to database', async () => {
    const testPrompt = await createTestPrompt();

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id,
      text: 'Database test text',
      description: 'Database test description',
      tags: ['dbTag1', 'dbTag2']
    };

    await updatePrompt(updateInput);

    // Query the database directly to verify changes were persisted
    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, testPrompt.id))
      .execute();

    expect(prompts).toHaveLength(1);
    expect(prompts[0].text).toEqual('Database test text');
    expect(prompts[0].description).toEqual('Database test description');
    expect(prompts[0].tags).toEqual(['dbTag1', 'dbTag2']);
    expect(prompts[0].updated_at).toBeInstanceOf(Date);
    expect(prompts[0].updated_at.getTime()).toBeGreaterThan(testPrompt.updated_at.getTime());
  });

  it('should only update timestamp when no other fields provided', async () => {
    const testPrompt = await createTestPrompt();
    const originalUpdatedAt = testPrompt.updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdatePromptInput = {
      id: testPrompt.id
    };

    const result = await updatePrompt(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(testPrompt.id);
    expect(result!.text).toEqual('Original prompt text'); // Unchanged
    expect(result!.description).toEqual('Original description'); // Unchanged
    expect(result!.tags).toEqual(['tag1', 'tag2']); // Unchanged
    expect(result!.updated_at).toBeInstanceOf(Date);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });
});