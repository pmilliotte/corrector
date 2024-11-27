import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examCorrect } from './examCorrect';
import { examCreate } from './examCreate';
import { examFileDelete } from './examFileDelete';
import { examFilesGet } from './examFilesGet';
import { examGet } from './examGet';
import { examList } from './examList';
import { presignedUrlGet } from './presignedUrlGet';
import { presignedUrlPost } from './presignedUrlPost';

export const examRouter = router({
  presignedUrlPost,
  presignedUrlGet,
  examCreate,
  examList,
  examGet,
  examFilesGet,
  examFileDelete,
  examCorrect,
});

export const handler = awsLambdaRequestHandler({
  router: examRouter,
  createContext,
});
