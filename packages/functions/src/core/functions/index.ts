import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomCreate } from './classroomCreate';
import { classroomGet } from './classroomGet';
import { classroomList } from './classroomList';
import { classroomStudentList } from './classroomStudentList';
import { organizationList } from './organizationList';
import { studentCreate } from './studentCreate';

export const coreRouter = router({
  organizationList,
  classroomList,
  classroomCreate,
  classroomStudentList,
  classroomGet,
  studentCreate,
});

export const handler = awsLambdaRequestHandler({
  router: coreRouter,
  createContext,
});
