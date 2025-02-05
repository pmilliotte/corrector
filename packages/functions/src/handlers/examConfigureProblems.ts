import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examConfigureProblems } from './trpc/examConfigureProblems';

export const examConfigureProblemsRouter = router({
  examConfigureProblems,
});

export const handler = awsLambdaRequestHandler({
  router: examConfigureProblemsRouter,
  createContext,
});
