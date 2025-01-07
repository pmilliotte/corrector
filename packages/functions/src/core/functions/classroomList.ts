import { TRPCError } from '@trpc/server';
import {
  BatchGetCommand,
  BatchGetRequest,
  executeBatchGet,
  Query,
  QueryCommand,
} from 'dynamodb-toolbox';
import compact from 'lodash/compact';
import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  ClassroomEntity,
  computeUserClassroomEntityPartitionKey,
  computeUserClassroomEntitySortKey,
  UserClassroomEntity,
} from '../libs';
import { OrganizationTable } from '../libs/table';

export const classroomList = authedProcedure
  .input(
    z.object({
      userId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { userId, organizationId } }) => {
    const { admin } = validateOrganizationAccess(organizationId, session);
    if (!admin) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const query: Query<typeof OrganizationTable> = {
      partition: computeUserClassroomEntityPartitionKey({ organizationId }),
      range: {
        beginsWith: computeUserClassroomEntitySortKey({
          userId,
          userType: 'teacher',
        }),
      },
    };

    const { Items: userClassrooms } = await OrganizationTable.build(
      QueryCommand,
    )
      .query(query)
      .entities(UserClassroomEntity)
      .send();

    if (userClassrooms === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    if (userClassrooms.length === 0) {
      return [];
    }

    const classroomCommand = OrganizationTable.build(BatchGetCommand).requests(
      ...userClassrooms.map(({ classroomId }) =>
        ClassroomEntity.build(BatchGetRequest).key({
          id: classroomId,
          organizationId,
        }),
      ),
    );

    const {
      Responses: [classrooms],
    } = await executeBatchGet(classroomCommand);

    return compact(classrooms);
  });
