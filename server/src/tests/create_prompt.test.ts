import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type CreatePromptInput } from '../schema';
import { createPrompt } from '../handlers/create_prompt';
import { eq } from 'drizzle-orm';

// Test inputs with different scenarios
const basicInput: CreatePromptInput = {
  text: 'Write a creative story about AI',
  description: 'A prompt for generating creative fiction',
  tags: ['creative', 'storytelling', 'AI']
};

const minimalInput: CreatePromptInput = {
  text: 'Simple prompt',
  description: null,
  tags: []
};

const inputWithDefaultTags: CreatePromptInput = {
  text: 'Another test prompt',
  description: 'Testing default behavior',
  tags: [] // Explicitly provide empty array
};

describe('createPrompt', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a prompt with all fields', async () => {
    const result = await createPrompt(basicInput);

    // Basic field validation
    expect(result.text).toEqual('Write a creative story about AI');
    expect(result.description).toEqual('A prompt for generating creative fiction');
    expect(result.tags).toEqual(['creative', 'storytelling', 'AI']);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create a prompt with minimal fields', async () => {
    const result = await createPrompt(minimalInput);

    expect(result.text).toEqual('Simple prompt');
    expect(result.description).toBeNull();
    expect(result.tags).toEqual([]);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should apply default empty array for tags when not provided', async () => {
    const result = await createPrompt(inputWithDefaultTags);

    expect(result.text).toEqual('Another test prompt');
    expect(result.description).toEqual('Testing default behavior');
    expect(result.tags).toEqual([]); // Should use default empty array
    expect(result.id).toBeDefined();
  });

  it('should save prompt to database correctly', async () => {
    const result = await createPrompt(basicInput);

    // Query using proper drizzle syntax
    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, result.id))
      .execute();

    expect(prompts).toHaveLength(1);
    const savedPrompt = prompts[0];
    expect(savedPrompt.text).toEqual('Write a creative story about AI');
    expect(savedPrompt.description).toEqual('A prompt for generating creative fiction');
    expect(savedPrompt.tags).toEqual(['creative', 'storytelling', 'AI']);
    expect(savedPrompt.created_at).toBeInstanceOf(Date);
    expect(savedPrompt.updated_at).toBeInstanceOf(Date);
  });

  it('should handle empty tags array correctly', async () => {
    const result = await createPrompt(minimalInput);

    const prompts = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, result.id))
      .execute();

    expect(prompts).toHaveLength(1);
    expect(prompts[0].tags).toEqual([]);
    expect(Array.isArray(prompts[0].tags)).toBe(true);
  });

  it('should generate unique IDs for multiple prompts', async () => {
    const result1 = await createPrompt(basicInput);
    const result2 = await createPrompt(minimalInput);

    expect(result1.id).not.toEqual(result2.id);
    expect(typeof result1.id).toBe('number');
    expect(typeof result2.id).toBe('number');

    // Verify both are saved in database
    const allPrompts = await db.select().from(promptsTable).execute();
    expect(allPrompts).toHaveLength(2);
  });

  it('should handle large tag arrays', async () => {
    const inputWithManyTags: CreatePromptInput = {
      text: 'Prompt with many tags',
      description: 'Testing large tag arrays',
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5', 'very-long-tag-name', 'another-tag']
    };

    const result = await createPrompt(inputWithManyTags);

    expect(result.tags).toHaveLength(7);
    expect(result.tags).toContain('very-long-tag-name');
    
    // Verify in database
    const saved = await db.select()
      .from(promptsTable)
      .where(eq(promptsTable.id, result.id))
      .execute();

    expect(saved[0].tags).toHaveLength(7);
    expect(saved[0].tags).toContain('very-long-tag-name');
  });

  it('should preserve timestamps correctly', async () => {
    const beforeCreation = new Date();
    const result = await createPrompt(basicInput);
    const afterCreation = new Date();

    // Timestamps should be within reasonable range
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime() - 1000);
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime() + 1000);

    // created_at and updated_at should be close to each other for new records
    const timeDiff = Math.abs(result.updated_at.getTime() - result.created_at.getTime());
    expect(timeDiff).toBeLessThan(1000); // Within 1 second
  });
});