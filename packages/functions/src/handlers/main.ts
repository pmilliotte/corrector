import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomCreate } from './trpc/classroomCreate';
import { classroomExamList } from './trpc/classroomExamList';
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
import { examSubjectPresignedUrlGet } from './trpc/examSubjectPresignedUrlGet';
import { examUploadedFileDelete } from './trpc/examUploadedFileDelete';
import { examUploadedFilePresignedUrlGet } from './trpc/examUploadedFilePresignedUrlGet';
import { examUploadedFilePresignedUrlPost } from './trpc/examUploadedFilePresignedUrlPost';
import { examUploadedSubjectDelete } from './trpc/examUploadedSubjectDelete';
import { examUploadFiles } from './trpc/examUploadFiles';
import { organizationList } from './trpc/organizationList';
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
  examSubjectPresignedUrlGet,
  examUploadedFilePresignedUrlGet,
  examSetReady,
  examUploadFiles,
  examAssignToClassroom,
  classroomExamList,
});

export const handler = awsLambdaRequestHandler({
  router: mainRouter,
  createContext,
});
