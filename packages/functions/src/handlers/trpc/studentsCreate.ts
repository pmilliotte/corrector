import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { PutItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import {
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  OrganizationTable,
  UserClassroomEntity,
  validateClassroomWriteAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const studentsCreate = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      classroomId: z.string(),
      students: z
        .object({
          firstName: z.string(),
          lastName: z.string(),
          identifier: z.number(),
        })
        .array()
        .max(50),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { classroomId, organizationId, students },
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

      await Promise.all(
        students.map(async ({ firstName, lastName, identifier }) => {
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
        }),
      );
    },
  );
