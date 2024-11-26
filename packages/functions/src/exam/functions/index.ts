import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examCreate } from './examCreate';
import { examFileDelete } from './examFileDelete';
import { examFilesGet } from './examFilesGet';
import { examGet } from './examGet';
import { examList } from './examList';
import { presignedUrlGet } from './presignedUrlGet';

export const examRouter = router({
  presignedUrlGet,
  examCreate,
  examList,
  examGet,
  examFilesGet,
  examFileDelete,
});

export const handler = awsLambdaRequestHandler({
  router: examRouter,
  createContext,
});
