import { PutObjectCommand } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import set from 'lodash/set';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import {
  EXAM_BLANK,
  examAnalysisSchema,
  updateQuestionMethodSchema,
} from '@corrector/shared';

import { s3Client } from '~/clients';
import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getExamAnalysis,
  getFileKeyPrefix,
  validateExamOwnership,
} from '../libs';

export const examSubjectAnalysisQuestionMethodUpdate = authedProcedure
  .input(
    z.intersection(
      updateQuestionMethodSchema,
      z.object({
        examId: z.string(),
        organizationId: z.string(),
      }),
    ),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { examId, organizationId, questionId, problemId, value },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { status } = await validateExamOwnership(
        { examId, organizationId },
        session,
      );

      if (status !== 'analyzed') {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const { id: userId } = session;
      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_BLANK,
      });
      const analysis = await getExamAnalysis(fileKeyPrefix);

      if (analysis.problems[problemId]?.questions[questionId] === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const newAnalysis = examAnalysisSchema.parse(analysis);

      const method =
        newAnalysis.problems[problemId]?.questions[questionId]?.method;

      if (method === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      set(
        newAnalysis,
        `problems.${problemId}.questions.${questionId}.method`,
        method.map(methodStep =>
          methodStep.id === value.id ? value : methodStep,
        ),
      );

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Bucket['exam-bucket'].bucketName,
          Key: `${fileKeyPrefix}/analysis.json`,
          Body: JSON.stringify(newAnalysis),
        }),
      );

      return newAnalysis;
    },
  );
