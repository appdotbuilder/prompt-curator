import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type GetPromptInput } from '../schema';
import { getPrompt } from '../handlers/get_prompt';
import { eq } from 'drizzle-orm';

describe('getPrompt', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a prompt when found', async () => {
    // Insert a test prompt first
    const insertResult = await db.insert(promptsTable)
      .values({
        text: 'Test prompt text',
        description: 'Test description',
        tags: ['tag1', 'tag2']
      })
      .returning()
      .execute();

    const createdPrompt = insertResult[0];

    // Test the handler
    const input: GetPromptInput = { id: createdPrompt.id };
    const result = await getPrompt(input);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdPrompt.id);
    expect(result!.text).toEqual('Test prompt text');
    expect(result!.description).toEqual('Test description');
    expect(result!.tags).toEqual(['tag1', 'tag2']);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when prompt not found', async () => {
    // Test with non-existent ID
    const input: GetPromptInput = { id: 999 };
    const result = await getPrompt(input);

    expect(result).toBeNull();
  });

  it('should handle prompts with null description', async () => {
    // Insert a prompt with null description
    const insertResult = await db.insert(promptsTable)
      .values({
        text: 'Prompt without description',
        description: null,
        tags: ['solo-tag']
      })
      .returning()
      .execute();

    const createdPrompt = insertResult[0];

    // Test the handler
    const input: GetPromptInput = { id: createdPrompt.id };
    const result = await getPrompt(input);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdPrompt.id);
    expect(result!.text).toEqual('Prompt without description');
    expect(result!.description).toBeNull();
    expect(result!.tags).toEqual(['solo-tag']);
  });

  it('should handle prompts with empty tags array', async () => {
    // Insert a prompt with empty tags
    const insertResult = await db.insert(promptsTable)
      .values({
        text: 'Prompt with no tags',
        description: 'Some description',
        tags: []
      })
      .returning()
      .execute();

    const createdPrompt = insertResult[0];

    // Test the handler
    const input: GetPromptInput = { id: createdPrompt.id };
    const result = await getPrompt(input);

    // Verify the result
    expect(result).toBeDefined();
    expect(result!.id).toEqual(createdPrompt.id);
    expect(result!.text).toEqual('Prompt with no tags');
    expect(result!.description).toEqual('Some description');
    expect(result!.tags).toEqual([]);
  });

  it('should verify database consistency', async () => {
    // Create a prompt and verify it exists in the database
    const insertResult = await db.insert(promptsTable)
      .values({
        text: 'Database consistency test',
        description: 'Testing database state',
        tags: ['consistency', 'test']
      })
      .returning()
      .execute();

    const createdPrompt = insertResult[0];

    // Get the prompt using our handler
    const input: GetPromptInput = { id: createdPrompt.id };
    const handlerResult = await getPrompt(input);

    // Directly query the database to compare
    const directQuery = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, createdPrompt.id))
      .execute();

    expect(handlerResult).toBeDefined();
    expect(directQuery).toHaveLength(1);
    
    // Compare handler result with direct database query
    const dbResult = directQuery[0];
    expect(handlerResult!.id).toEqual(dbResult.id);
    expect(handlerResult!.text).toEqual(dbResult.text);
    expect(handlerResult!.description).toEqual(dbResult.description);
    expect(handlerResult!.tags).toEqual(dbResult.tags);
  });
});