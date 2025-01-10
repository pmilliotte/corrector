import { PutObjectCommand } from '@aws-sdk/client-s3';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { writeFileSync } from 'fs';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import { s3Client } from '~/clients';
import {
  getFileKeyPrefix,
  getResponseAnalysisChain,
  ResponseEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examResponseAnalyze = authedProcedure
  .input(
    z.object({
      responseId: z.string(),
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { responseId, examId, organizationId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { subject, division } = await validateExamOwnership(
        { examId },
        session,
      );

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_RESPONSE,
        fileId: responseId,
      });

      const chain = await getResponseAnalysisChain({
        division,
        subject,
        organizationId,
        userId,
        examId,
        fileId: responseId,
      });

      const response = await chain.invoke({});

      writeFileSync(
        '/Users/pierremilliotte/Projects/corrector/response.json',
        JSON.stringify(response),
      );

      console.log('RESPONSE OOOOOOOOOOOKKKKKKKKKKKKKK');

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: `${fileKeyPrefix}/analysis.json`,
          Body: JSON.stringify(response),
        }),
      );

      await ResponseEntity.build(UpdateItemCommand)
        .item({ id: responseId, examId, organizationId, status: 'analyzed' })
        .send();
    },
  );
