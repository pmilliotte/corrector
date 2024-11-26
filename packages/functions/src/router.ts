import { coreRouter } from './core';
import { examRouter } from './exam';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(coreRouter, examRouter);

// Exported for frontend
export type AppRouter = typeof appRouter;
