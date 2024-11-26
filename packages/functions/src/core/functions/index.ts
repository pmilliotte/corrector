import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { organizationsGet } from './organizationsGet';

export const coreRouter = router({
  organizationsGet,
});

export const handler = awsLambdaRequestHandler({
  router: coreRouter,
  createContext,
});
