import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examGeneratePdf } from './trpc/examGeneratePdf';

export const examGeneratePdfRouter = router({
  examGeneratePdf,
});

export const handler = awsLambdaRequestHandler({
  router: examGeneratePdfRouter,
  createContext,
});
