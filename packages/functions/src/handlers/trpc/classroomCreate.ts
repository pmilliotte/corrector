import { randomUUID } from 'crypto';
import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { DIVISIONS } from '@corrector/shared';

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
      schoolName: z.string(),
      division: z.enum(DIVISIONS),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { classroomName, organizationId, schoolName, division },
    }) => {
      validateOrganizationAccess(organizationId, session);

      const { id: userId } = session;

      const id = randomUUID();

      await ClassroomEntity.build(PutItemCommand)
        .item({
          id,
          classroomName,
          schoolName,
          organizationId,
          division,
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
