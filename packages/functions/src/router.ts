import { examConfigureProblemsRouter } from './handlers/examConfigureProblems';
import { examGeneratePdfRouter } from './handlers/examGeneratePdf';
import { mainRouter } from './handlers/main';
import { pdfSplitToImagesRouter } from './handlers/pdfSplitToImages';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(
  mainRouter,
  examGeneratePdfRouter,
  pdfSplitToImagesRouter,
  examConfigureProblemsRouter,
);

// Exported for frontend
export type AppRouter = typeof appRouter;
