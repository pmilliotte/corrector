import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { getChain, validateExamOwnership } from '../libs';

export const examCorrect = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { examId, organizationId } }) => {
    validateOrganizationAccess(organizationId, session);
    const { subject } = await validateExamOwnership(
      { examId, organizationId },
      session,
    );

    getChain({
      subject,
      division: '9',
    });

    // console.log('chain', chain);
  });
