import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createPromptInputSchema, 
  updatePromptInputSchema, 
  deletePromptInputSchema,
  getPromptInputSchema
} from './schema';

// Import handlers
import { createPrompt } from './handlers/create_prompt';
import { getPrompts } from './handlers/get_prompts';
import { getPrompt } from './handlers/get_prompt';
import { updatePrompt } from './handlers/update_prompt';
import { deletePrompt } from './handlers/delete_prompt';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check endpoint
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Create a new prompt
  createPrompt: publicProcedure
    .input(createPromptInputSchema)
    .mutation(({ input }) => createPrompt(input)),

  // Get all prompts
  getPrompts: publicProcedure
    .query(() => getPrompts()),

  // Get a single prompt by ID
  getPrompt: publicProcedure
    .input(getPromptInputSchema)
    .query(({ input }) => getPrompt(input)),

  // Update an existing prompt
  updatePrompt: publicProcedure
    .input(updatePromptInputSchema)
    .mutation(({ input }) => updatePrompt(input)),

  // Delete a prompt
  deletePrompt: publicProcedure
    .input(deletePromptInputSchema)
    .mutation(({ input }) => deletePrompt(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();