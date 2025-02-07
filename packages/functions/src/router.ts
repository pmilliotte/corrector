import { examConfigureProblemsRouter } from './handlers/examConfigureProblems';
import { generatePdfRouter } from './handlers/generatePdf';
import { mainRouter } from './handlers/main';
import { pdfSplitToImagesRouter } from './handlers/pdfSplitToImages';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(
  mainRouter,
  generatePdfRouter,
  pdfSplitToImagesRouter,
  examConfigureProblemsRouter,
);

// Exported for frontend
export type AppRouter = typeof appRouter;
