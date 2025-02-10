import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examAnswersSplit } from './trpc/examAnswersSplit';
import { examConfigureProblems } from './trpc/examConfigureProblems';

export const aiInterfaceRouter = router({
  examConfigureProblems,
  examAnswersSplit,
});

export const handler = awsLambdaRequestHandler({
  router: aiInterfaceRouter,
  createContext,
});
