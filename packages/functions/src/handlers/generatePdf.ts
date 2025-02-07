import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { createContext, router } from '~/trpc';

import { classroomExamGeneratePdf } from './trpc/classroomExamGeneratePdf';
import { examGeneratePdf } from './trpc/examGeneratePdf';

export const generatePdfRouter = router({
  examGeneratePdf,
  classroomExamGeneratePdf,
});

export const handler = awsLambdaRequestHandler({
  router: generatePdfRouter,
  createContext,
});
