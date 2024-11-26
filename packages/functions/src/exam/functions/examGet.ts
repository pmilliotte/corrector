import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { ExamEntity } from '../libs';

export const examGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { id, organizationId } }) => {
    validateOrganizationAccess(organizationId, session);

    const { Item: exam } = await ExamEntity.build(GetItemCommand)
      .key({ id, organizationId })
      .send();

    if (exam === undefined) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return { exam };
  });
