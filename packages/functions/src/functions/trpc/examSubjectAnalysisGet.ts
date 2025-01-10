import { z } from 'zod';

import { EXAM_BLANK } from '@corrector/shared';

import {
  getExamAnalysis,
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSubjectAnalysisGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { id: examId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      const { status } = await validateExamOwnership({ examId }, session);

      if (['subject', 'imagesUploaded'].includes(status)) {
        return;
      }

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_BLANK,
      });

      const analysis = await getExamAnalysis(fileKeyPrefix);

      return analysis;
    },
  );
