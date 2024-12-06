import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { getAnalysis, getFileKeyPrefix, validateExamOwnership } from '../libs';

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
      const { status } = await validateExamOwnership(
        { examId, organizationId },
        session,
      );

      if (['subject', 'imagesUploaded'].includes(status)) {
        return;
      }

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
      });

      const analysis = await getAnalysis(fileKeyPrefix);

      return analysis;
    },
  );
