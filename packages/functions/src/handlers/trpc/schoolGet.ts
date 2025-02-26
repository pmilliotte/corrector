import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { SchoolEntity, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const schoolGet = authedProcedure
  .input(
    z.object({
      schoolId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { schoolId, organizationId } }) => {
    validateOrganizationAccess(organizationId, session);

    const { Item: school } = await SchoolEntity.build(GetItemCommand)
      .key({
        id: schoolId,
        organizationId,
      })
      .send();

    if (school === undefined) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return school;
  });
