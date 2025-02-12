import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  ClassroomEntity,
  SchoolEntity,
  validateOrganizationAccess,
} from '~/libs';
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

      const { Item: school } = await SchoolEntity.build(GetItemCommand)
        .key({
          id: classroom.schoolId,
          organizationId,
        })
        .send();

      if (school === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return { ...classroom, schoolName: school.name };
    },
  );
