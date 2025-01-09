import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { examCreate } from './examCreate';
import { examFileGet } from './examFileGet';
import { examFilesGet } from './examFilesGet';
import { examGet } from './examGet';
import { examList } from './examList';
import { examResponseAnalysisGet } from './examResponseAnalysisGet';
import { examResponseAnalyze } from './examResponseAnalyze';
import { examResponseList } from './examResponseList';
import { examSubjectAnalysisGet } from './examSubjectAnalysisGet';
import { examSubjectAnalysisQuestionMethodAdd } from './examSubjectAnalysisQuestionMethodAdd';
import { examSubjectAnalysisQuestionMethodDelete } from './examSubjectAnalysisQuestionMethodDelete';
import { examSubjectAnalysisQuestionMethodUpdate } from './examSubjectAnalysisQuestionMethodUpdate';
import { examSubjectAnalysisQuestionUpdate } from './examSubjectAnalysisQuestionUpdate';
import { examSubjectAnalyze } from './examSubjectAnalyze';
import { examSubjectDelete } from './examSubjectDelete';
import { examUpdate } from './examUpdate';
import { examUploadedFileDelete } from './examUploadedFileDelete';
import { examUploadedFilePresignedUrlList } from './examUploadedFilePresignedUrlList';
import { examUploadedFilePresignedUrlPost } from './examUploadedFilePresignedUrlPost';
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
  examResponseAnalyze,
  examResponseList,
  responseCreate,
  responseList,
  responseDelete,
  examSubjectAnalysisQuestionMethodAdd,
  examSubjectAnalysisQuestionMethodDelete,
  examSubjectAnalysisQuestionUpdate,
  examSubjectAnalysisQuestionMethodUpdate,
  examResponseAnalysisGet,
  examUploadedFilePresignedUrlPost,
  examUploadedFilePresignedUrlList,
  examUploadedFileDelete,
  examUpdate,
});

export const handler = awsLambdaRequestHandler({
  router: examRouter,
  createContext,
});
