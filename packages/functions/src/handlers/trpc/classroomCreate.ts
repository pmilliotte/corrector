import { randomUUID } from 'crypto';
import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { DIVISIONS, SCHOOL_YEARS } from '@corrector/shared';

import {
  ClassroomEntity,
  UserClassroomEntity,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomCreate = authedProcedure
  .input(
    z.object({
      classroomName: z.string(),
      schoolId: z.string().uuid(),
      division: z.enum(DIVISIONS),
      schoolYear: z.enum(SCHOOL_YEARS),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { classroomName, organizationId, schoolId, division, schoolYear },
    }) => {
      validateOrganizationAccess(organizationId, session);

      const { id: userId } = session;

      const id = randomUUID();

      await ClassroomEntity.build(PutItemCommand)
        .item({
          id,
          classroomName,
          schoolId,
          organizationId,
          division,
          schoolYear,
        })
        .options({
          condition: {
            attr: 'id',
            exists: false,
          },
        })
        .send();

      await UserClassroomEntity.build(PutItemCommand)
        .item({
          classroomId: id,
          userId,
          organizationId,
          userType: 'teacher',
        })
        .send();

      return { id };
    },
  );
