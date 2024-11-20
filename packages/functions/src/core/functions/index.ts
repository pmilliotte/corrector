import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { organizationsGet } from './organizationsGet';
import { userCreate } from './userCreate';

export const coreRouter = router({
  userCreate,
  organizationsGet,
});

export const handler = awsLambdaRequestHandler({
  router: coreRouter,
  createContext,
});
