import { examGeneratePdfRouter } from './handlers/examGeneratePdf';
import { mainRouter } from './handlers/main';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(mainRouter, examGeneratePdfRouter);

// Exported for frontend
export type AppRouter = typeof appRouter;
