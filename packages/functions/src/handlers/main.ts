import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomCreate } from './trpc/classroomCreate';
import { classroomExamAnswerList } from './trpc/classroomExamAnswerList';
import { classroomExamGet } from './trpc/classroomExamGet';
import { classroomExamList } from './trpc/classroomExamList';
import { classroomExamUploadedFilePresignedUrlPost } from './trpc/classroomExamUploadedFilePresignedUrlPost';
import { classroomGet } from './trpc/classroomGet';
import { classroomList } from './trpc/classroomList';
import { classroomStudentList } from './trpc/classroomStudentList';
import { examAssignToClassroom } from './trpc/examAssignToClassroom';
import { examCreate } from './trpc/examCreate';
import { examGet } from './trpc/examGet';
import { examList } from './trpc/examList';
import { examSetReady } from './trpc/examSetReady';
import { examStatementDelete } from './trpc/examStatementDelete';
import { examStatementInsert } from './trpc/examStatementInsert';
import { examStatementUpdate } from './trpc/examStatementUpdate';
import { examUploadedFileDelete } from './trpc/examUploadedFileDelete';
import { examUploadedFilePresignedUrlGet } from './trpc/examUploadedFilePresignedUrlGet';
import { examUploadedFilePresignedUrlPost } from './trpc/examUploadedFilePresignedUrlPost';
import { examUploadedSubjectDelete } from './trpc/examUploadedSubjectDelete';
import { examUploadFiles } from './trpc/examUploadFiles';
import { organizationList } from './trpc/organizationList';
import { pdfPresignedUrlGet } from './trpc/pdfPresignedUrlGet';
import { studentCreate } from './trpc/studentCreate';

export const mainRouter = router({
  organizationList,
  classroomList,
  classroomCreate,
  classroomStudentList,
  classroomGet,
  studentCreate,
  examList,
  examGet,
  examCreate,
  examStatementInsert,
  examUploadedFilePresignedUrlPost,
  examUploadedFileDelete,
  examUploadedSubjectDelete,
  examStatementDelete,
  examStatementUpdate,
  pdfPresignedUrlGet,
  examUploadedFilePresignedUrlGet,
  examSetReady,
  examUploadFiles,
  examAssignToClassroom,
  classroomExamList,
  classroomExamGet,
  classroomExamUploadedFilePresignedUrlPost,
  classroomExamAnswerList,
});

export const handler = awsLambdaRequestHandler({
  router: mainRouter,
  createContext,
});
