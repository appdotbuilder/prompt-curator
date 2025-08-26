import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { promptsTable } from '../db/schema';
import { type CreatePromptInput } from '../schema';
import { getPrompts } from '../handlers/get_prompts';

// Test data setup
const testPrompt1: CreatePromptInput = {
  text: 'Write a story about a magical forest',
  description: 'A creative writing prompt about fantasy',
  tags: ['creative', 'fantasy', 'writing']
};

const testPrompt2: CreatePromptInput = {
  text: 'Explain quantum physics in simple terms',
  description: 'An educational prompt about science',
  tags: ['education', 'science', 'physics']
};

const testPrompt3: CreatePromptInput = {
  text: 'Create a business plan for a startup',
  description: null,
  tags: []
};

describe('getPrompts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no prompts exist', async () => {
    const result = await getPrompts();

    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
  });

  it('should return all prompts when they exist', async () => {
    // Insert test prompts
    await db.insert(promptsTable)
      .values([
        {
          text: testPrompt1.text,
          description: testPrompt1.description,
          tags: testPrompt1.tags
        },
        {
          text: testPrompt2.text,
          description: testPrompt2.description,
          tags: testPrompt2.tags
        }
      ])
      .execute();

    const result = await getPrompts();

    expect(result).toHaveLength(2);
    
    // Verify first prompt
    const prompt1 = result.find(p => p.text === testPrompt1.text);
    expect(prompt1).toBeDefined();
    expect(prompt1!.description).toEqual(testPrompt1.description);
    expect(prompt1!.tags).toEqual(testPrompt1.tags);
    expect(prompt1!.id).toBeDefined();
    expect(prompt1!.created_at).toBeInstanceOf(Date);
    expect(prompt1!.updated_at).toBeInstanceOf(Date);

    // Verify second prompt
    const prompt2 = result.find(p => p.text === testPrompt2.text);
    expect(prompt2).toBeDefined();
    expect(prompt2!.description).toEqual(testPrompt2.description);
    expect(prompt2!.tags).toEqual(testPrompt2.tags);
    expect(prompt2!.id).toBeDefined();
    expect(prompt2!.created_at).toBeInstanceOf(Date);
    expect(prompt2!.updated_at).toBeInstanceOf(Date);
  });

  it('should handle prompts with null description and empty tags', async () => {
    // Insert prompt with null description and empty tags
    await db.insert(promptsTable)
      .values({
        text: testPrompt3.text,
        description: testPrompt3.description,
        tags: testPrompt3.tags
      })
      .execute();

    const result = await getPrompts();

    expect(result).toHaveLength(1);
    expect(result[0].text).toEqual(testPrompt3.text);
    expect(result[0].description).toBeNull();
    expect(result[0].tags).toEqual([]);
    expect(Array.isArray(result[0].tags)).toBe(true);
  });

  it('should return prompts with proper data types', async () => {
    // Insert a test prompt
    await db.insert(promptsTable)
      .values({
        text: testPrompt1.text,
        description: testPrompt1.description,
        tags: testPrompt1.tags
      })
      .execute();

    const result = await getPrompts();

    expect(result).toHaveLength(1);
    const prompt = result[0];
    
    // Verify all field types
    expect(typeof prompt.id).toBe('number');
    expect(typeof prompt.text).toBe('string');
    expect(typeof prompt.description).toBe('string');
    expect(Array.isArray(prompt.tags)).toBe(true);
    expect(prompt.created_at).toBeInstanceOf(Date);
    expect(prompt.updated_at).toBeInstanceOf(Date);
    
    // Verify tag array contains strings
    prompt.tags.forEach(tag => {
      expect(typeof tag).toBe('string');
    });
  });

  it('should return multiple prompts in database insertion order', async () => {
    // Insert prompts in specific order
    await db.insert(promptsTable)
      .values({
        text: 'First prompt',
        description: 'First description',
        tags: ['first']
      })
      .execute();

    await db.insert(promptsTable)
      .values({
        text: 'Second prompt',
        description: 'Second description',
        tags: ['second']
      })
      .execute();

    await db.insert(promptsTable)
      .values({
        text: 'Third prompt',
        description: 'Third description',
        tags: ['third']
      })
      .execute();

    const result = await getPrompts();

    expect(result).toHaveLength(3);
    
    // Verify IDs are sequential (indicating order)
    expect(result[0].id).toBeLessThan(result[1].id);
    expect(result[1].id).toBeLessThan(result[2].id);
    
    // Verify content
    expect(result[0].text).toEqual('First prompt');
    expect(result[1].text).toEqual('Second prompt');
    expect(result[2].text).toEqual('Third prompt');
  });
});