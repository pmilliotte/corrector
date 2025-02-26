import { TRPCError } from '@trpc/server';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { SchoolEntity, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const schoolUpdate = authedProcedure
  .input(
    z.object({
      schoolId: z.string(),
      pseudo: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { schoolId, pseudo, organizationId },
    }) => {
      const { admin } = validateOrganizationAccess(organizationId, session);
      if (!admin) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await SchoolEntity.build(UpdateItemCommand)
        .item({ id: schoolId, organizationId, pseudo })
        .send();
    },
  );
