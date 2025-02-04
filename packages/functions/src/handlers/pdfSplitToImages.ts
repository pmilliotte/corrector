import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { pdfSplitToImages } from './trpc/pdfSplitToImages';

export const pdfSplitToImagesRouter = router({
  pdfSplitToImages,
});

export const handler = awsLambdaRequestHandler({
  router: pdfSplitToImagesRouter,
  createContext,
});
