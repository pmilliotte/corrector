import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomCreate } from './trpc/classroomCreate';
import { classroomGet } from './trpc/classroomGet';
import { classroomList } from './trpc/classroomList';
import { classroomStudentList } from './trpc/classroomStudentList';
import { examConfigureProblems } from './trpc/examConfigureProblems';
import { examCreate } from './trpc/examCreate';
import { examFileGet } from './trpc/examFileGet';
import { examFilesGet } from './trpc/examFilesGet';
import { examGeneratePdf } from './trpc/examGeneratePdf';
import { examGet } from './trpc/examGet';
import { examList } from './trpc/examList';
import { examResponseAnalysisGet } from './trpc/examResponseAnalysisGet';
import { examResponseList } from './trpc/examResponseList';
import { examSetReady } from './trpc/examSetReady';
import { examStatementDelete } from './trpc/examStatementDelete';
import { examStatementInsert } from './trpc/examStatementInsert';
import { examStatementUpdate } from './trpc/examStatementUpdate';
import { examSubjectAnalysisGet } from './trpc/examSubjectAnalysisGet';
import { examSubjectAnalysisQuestionMethodAdd } from './trpc/examSubjectAnalysisQuestionMethodAdd';
import { examSubjectAnalysisQuestionMethodDelete } from './trpc/examSubjectAnalysisQuestionMethodDelete';
import { examSubjectAnalysisQuestionMethodUpdate } from './trpc/examSubjectAnalysisQuestionMethodUpdate';
import { examSubjectAnalysisQuestionUpdate } from './trpc/examSubjectAnalysisQuestionUpdate';
import { examSubjectPresignedUrlGet } from './trpc/examSubjectPresignedUrlGet';
import { examUploadedFileDelete } from './trpc/examUploadedFileDelete';
import { examUploadedFilePresignedUrlList } from './trpc/examUploadedFilePresignedUrlList';
import { examUploadedFilePresignedUrlPost } from './trpc/examUploadedFilePresignedUrlPost';
import { examUploadedFileStatusList } from './trpc/examUploadedFileStatusList';
import { organizationList } from './trpc/organizationList';
import { presignedUrlGet } from './trpc/presignedUrlGet';
import { presignedUrlPost } from './trpc/presignedUrlPost';
import { responseCreate } from './trpc/responseCreate';
import { responseDelete } from './trpc/responseDelete';
import { responseList } from './trpc/responseList';
import { studentCreate } from './trpc/studentCreate';

export const coreRouter = router({
  organizationList,
  classroomList,
  classroomCreate,
  classroomStudentList,
  classroomGet,
  studentCreate,
  presignedUrlPost,
  presignedUrlGet,
  examCreate,
  examList,
  examGet,
  examFilesGet,
  examFileGet,
  examSubjectAnalysisGet,
  examResponseList,
  examStatementInsert,
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
  examConfigureProblems,
  examStatementDelete,
  examStatementUpdate,
  examGeneratePdf,
  examUploadedFileStatusList,
  examSubjectPresignedUrlGet,
  examSetReady,
});

export const handler = awsLambdaRequestHandler({
  router: coreRouter,
  createContext,
});
