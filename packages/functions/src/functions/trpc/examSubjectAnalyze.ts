import { PutObjectCommand } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_BLANK, examOutputToAnalysis } from '@corrector/shared';

import { s3Client } from '~/clients';
import {
  ExamEntity,
  getExamAnalysisChain,
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSubjectAnalyze = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({ ctx: { session }, input: { id: examId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      const { subject, division, status } = await validateExamOwnership(
        { examId },
        session,
      );

      if (status !== 'imagesUploaded') {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_BLANK,
      });

      const chain = await getExamAnalysisChain({
        subject,
        division,
        organizationId,
        userId,
        examId,
      });

      const examOutput = await chain.invoke({});

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: `${fileKeyPrefix}/analysis.json`,
          Body: JSON.stringify(examOutputToAnalysis(examOutput)),
        }),
      );

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status: 'analyzed' })
        .send();
    },
  );
