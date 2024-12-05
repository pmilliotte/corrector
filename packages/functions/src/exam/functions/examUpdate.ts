import { TRPCError } from '@trpc/server';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { EXAM_STATUSES } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { ExamEntity, validateExamOwnership } from '../libs';

const NEXT_STATUSES = {
  subject: 'marks',
  marks: 'responses',
  responses: 'correction',
  correction: undefined,
};

export const examUpdate = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
      status: z.enum(EXAM_STATUSES),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { id: examId, organizationId, status },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { status: currentStatus } = await validateExamOwnership(
        { examId, organizationId },
        session,
      );

      if (NEXT_STATUSES[currentStatus] !== status) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status })
        .send();
    },
  );
