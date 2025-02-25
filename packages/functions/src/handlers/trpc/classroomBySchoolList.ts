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

import {
  ClassroomEntity,
  computeSchoolEntityPartitionKey,
  computeUserClassroomEntityPartitionKey,
  computeUserClassroomEntitySortKey,
  OrganizationTable,
  SchoolEntity,
  UserClassroomEntity,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomBySchoolList = authedProcedure
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

    const schoolsQuery: Query<typeof OrganizationTable> = {
      partition: computeSchoolEntityPartitionKey({ organizationId }),
    };

    const userClassroomsQuery: Query<typeof OrganizationTable> = {
      partition: computeUserClassroomEntityPartitionKey({ organizationId }),
      range: {
        beginsWith: computeUserClassroomEntitySortKey({
          userId,
          userType: 'teacher',
        }),
      },
    };

    const [{ Items: schools }, { Items: userClassrooms }] = await Promise.all([
      OrganizationTable.build(QueryCommand)
        .query(schoolsQuery)
        .entities(SchoolEntity)
        .send(),
      OrganizationTable.build(QueryCommand)
        .query(userClassroomsQuery)
        .entities(UserClassroomEntity)
        .send(),
    ]);

    if (schools === undefined || userClassrooms === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    if (userClassrooms.length === 0) {
      return schools.map(({ name, id, city, pseudo }) => ({
        name,
        id,
        city,
        pseudo,
        classrooms: [],
      }));
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

    return schools.map(({ name, id, city, pseudo }) => ({
      name,
      id,
      city,
      pseudo,
      classrooms: compact(classrooms)
        .filter(classroom => classroom.schoolId === id)
        .map(({ id: classroomId, division, classroomName, schoolYear }) => ({
          id: classroomId,
          division,
          classroomName,
          schoolYear,
        })),
    }));
  });
