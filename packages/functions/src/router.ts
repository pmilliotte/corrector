import { aiInterfaceRouter } from './handlers/aiInterface';
import { generatePdfRouter } from './handlers/generatePdf';
import { mainRouter } from './handlers/main';
import { pdfSplitToImagesRouter } from './handlers/pdfSplitToImages';
import { mergeRouters } from './trpc';

const appRouter = mergeRouters(
  mainRouter,
  generatePdfRouter,
  pdfSplitToImagesRouter,
  aiInterfaceRouter,
);

// Exported for frontend
export type AppRouter = typeof appRouter;
