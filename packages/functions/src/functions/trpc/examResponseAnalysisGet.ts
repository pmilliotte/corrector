import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import {
  getFileKeyPrefix,
  getResponseAnalysis,
  ResponseEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examResponseAnalysisGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { id, examId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      const { status } = await validateExamOwnership({ examId }, session);

      if (['subject', 'imagesUploaded'].includes(status)) {
        return;
      }

      const { Item: response } = await ResponseEntity.build(GetItemCommand)
        .key({ id, examId, organizationId })
        .send();

      if (response === undefined) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_RESPONSE,
        fileId: id,
      });

      const analysis = await getResponseAnalysis(fileKeyPrefix);

      return analysis;
    },
  );
