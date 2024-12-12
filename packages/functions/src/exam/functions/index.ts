import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examCreate } from './examCreate';
import { examFileGet } from './examFileGet';
import { examFilesGet } from './examFilesGet';
import { examGet } from './examGet';
import { examList } from './examList';
import { examResponseList } from './examResponseList';
import { examSubjectAnalysisGet } from './examSubjectAnalysisGet';
import { examSubjectAnalysisUpdate } from './examSubjectAnalysisUpdate';
import { examSubjectAnalyze } from './examSubjectAnalyze';
import { examSubjectDelete } from './examSubjectDelete';
import { presignedUrlGet } from './presignedUrlGet';
import { presignedUrlPost } from './presignedUrlPost';
import { responseCreate } from './responseCreate';
import { responseDelete } from './responseDelete';
import { responseList } from './responseList';

export const examRouter = router({
  presignedUrlPost,
  presignedUrlGet,
  examCreate,
  examList,
  examGet,
  examFilesGet,
  examSubjectDelete,
  examFileGet,
  examSubjectAnalyze,
  examSubjectAnalysisGet,
  examSubjectAnalysisUpdate,
  examResponseList,
  responseCreate,
  responseList,
  responseDelete,
});

export const handler = awsLambdaRequestHandler({
  router: examRouter,
  createContext,
});
