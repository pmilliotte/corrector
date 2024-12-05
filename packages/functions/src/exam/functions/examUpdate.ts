import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { EXAM_STATUSES } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { ExamEntity, validateExamOwnership } from '../libs';

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
      await validateExamOwnership({ examId, organizationId }, session);

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status })
        .send();
    },
  );
