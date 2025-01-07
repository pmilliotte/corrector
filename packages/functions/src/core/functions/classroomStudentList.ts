import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  UserClassroomEntity,
} from '../libs';
import { OrganizationTable } from '../libs/table';

export const classroomStudentList = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { organizationId, classroomId } }) => {
      validateOrganizationAccess(organizationId, session);

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

      return {
        students: classroomStudents.map(
          ({ [$entity]: _entityName, ...restOfStudent }) => restOfStudent,
        ),
      };
    },
  );
