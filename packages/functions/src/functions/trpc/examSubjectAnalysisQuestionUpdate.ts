import { PutObjectCommand } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import set from 'lodash/set';
import { Resource } from 'sst';
import { z } from 'zod';

import {
  EXAM_BLANK,
  examAnalysisSchema,
  updateQuestionSchema,
} from '@corrector/shared';

import { s3Client } from '~/clients';
import {
  getExamAnalysis,
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSubjectAnalysisQuestionUpdate = authedProcedure
  .input(
    z.intersection(
      updateQuestionSchema,
      z.object({
        examId: z.string(),
        organizationId: z.string(),
      }),
    ),
  )
  .mutation(
    async ({
      ctx: { session },
      input: {
        examId,
        organizationId,
        questionId,
        problemId,
        propertyName,
        value,
      },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { status } = await validateExamOwnership({ examId }, session);

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

      set(
        newAnalysis,
        `problems.${problemId}.questions.${questionId}.${propertyName}`,
        value,
      );

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: `${fileKeyPrefix}/analysis.json`,
          Body: JSON.stringify(newAnalysis),
        }),
      );

      return newAnalysis;
    },
  );
