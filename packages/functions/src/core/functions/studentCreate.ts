import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { PutItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import { authedProcedure } from '~/trpc';

import {
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  UserClassroomEntity,
  validateClassroomWriteAccess,
} from '../libs';
import { OrganizationTable } from '../libs/table';

export const studentCreate = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      organizationId: z.string(),
      identifier: z.number(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { classroomId, organizationId, firstName, lastName, identifier },
    }) => {
      await validateClassroomWriteAccess(
        { organizationId, classroomId },
        session,
      );

      const query: Query<typeof OrganizationTable> = {
        partition: computeUserClassroomEntityPartitionKey({ organizationId }),
        index: LSI1,
        range: {
          beginsWith: computeUserClassroomEntityLSI1Key({
            classroomId,
            userType: 'student',
            identifier,
          }),
        },
      };

      const { Items: classroomStudents } = await OrganizationTable.build(
        QueryCommand,
      )
        .query(query)
        .entities(UserClassroomEntity)
        .send();

      if (classroomStudents === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      if (classroomStudents.length > 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const userId = randomUUID();

      await UserClassroomEntity.build(PutItemCommand)
        .item({
          classroomId,
          userId,
          userType: 'student',
          firstName,
          lastName,
          identifier,
          organizationId,
        })
        .send();

      return { id: userId };
    },
  );
