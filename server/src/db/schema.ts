import { serial, text, pgTable, timestamp, json } from 'drizzle-orm/pg-core';

export const promptsTable = pgTable('prompts', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  description: text('description'), // Nullable by default, matches Zod schema
  image_url: text('image_url'), // Optional image URL field
  tags: json('tags').$type<string[]>().notNull().default([]), // JSON array of strings with default empty array
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Prompt = typeof promptsTable.$inferSelect; // For SELECT operations
export type NewPrompt = typeof promptsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { prompts: promptsTable };