import { coreRouter } from './core';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(coreRouter);

// Exported for frontend
export type AppRouter = typeof appRouter;