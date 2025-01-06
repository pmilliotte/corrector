import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../table';

export const USER_CLASSROOM_ENTITY_NAME = 'UserClassroom';

const userClassroomSchema = schema({
  classroomId: string().key(),
  userId: string().key(),
  organizationId: string().key(),
});

export const computeUserClassroomEntityPartitionKey = ({
  organizationId,
}: {
  organizationId: string;
}): string => `${USER_CLASSROOM_ENTITY_NAME}#organizationId=${organizationId}`;

export const computeUserClassroomEntitySortKey = ({
  userId,
  classroomId,
}: {
  userId: string;
  classroomId?: string;
}): string => {
  if (classroomId === undefined) {
    return `userId=${userId}#`;
  }

  return `userId=${userId}#classroomId=${classroomId}`;
};

export const UserClassroomEntity = new Entity({
  name: USER_CLASSROOM_ENTITY_NAME,
  schema: userClassroomSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ classroomId, userId, organizationId }) => ({
    [PARTITION_KEY]: computeUserClassroomEntityPartitionKey({
      organizationId,
    }),
    [SORT_KEY]: computeUserClassroomEntitySortKey({
      userId,
      classroomId,
    }),
  }),
});

export type UserClassroom = FormattedItem<typeof UserClassroomEntity>;
