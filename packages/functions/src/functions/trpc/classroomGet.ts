import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ClassroomEntity, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomGet = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { classroomId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);

      const { Item: classroom } = await ClassroomEntity.build(GetItemCommand)
        .key({
          id: classroomId,
          organizationId,
        })
        .send();

      if (classroom === undefined) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return classroom;
    },
  );
