import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examCreate } from './examCreate';
import { examFileDelete } from './examFileDelete';
import { examFileGet } from './examFileGet';
import { examFilesGet } from './examFilesGet';
import { examGet } from './examGet';
import { examList } from './examList';
import { examMarksGet } from './examMarksGet';
import { examUpdate } from './examUpdate';
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
  examFileGet,
  examUpdate,
  examMarksGet,
});

export const handler = awsLambdaRequestHandler({
  router: examRouter,
  createContext,
});
