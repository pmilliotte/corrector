import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomCreate } from './classroomCreate';
import { classroomList } from './classroomList';
import { organizationList } from './organizationList';

export const coreRouter = router({
  organizationList,
  classroomList,
  classroomCreate,
});

export const handler = awsLambdaRequestHandler({
  router: coreRouter,
  createContext,
});
