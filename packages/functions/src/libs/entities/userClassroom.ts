import {
  Entity,
  FormattedItem,
  number,
  schema,
  string,
} from 'dynamodb-toolbox';

import { LSI1_SK, PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { USER_TYPES } from '@corrector/shared';

import { OrganizationTable } from '../tables';

export const USER_CLASSROOM_ENTITY_NAME = 'UserClassroom';

const userClassroomSchema = schema({
  classroomId: string().key(),
  userId: string().key(),
  organizationId: string().key(),
  userType: string()
    .enum(...USER_TYPES)
    .key(),
  firstName: string().optional(),
  lastName: string().optional(),
  identifier: number().optional(),
}).and(prevSchema => ({
  [LSI1_SK]: string().link<typeof prevSchema>(
    ({ classroomId, userType, userId, identifier }) =>
      computeUserClassroomEntityLSI1Key({
        classroomId,
        userType,
        userId,
        identifier,
      }),
  ),
}));

export const computeUserClassroomEntityPartitionKey = ({
  organizationId,
}: {
  organizationId: string;
}): string => `${USER_CLASSROOM_ENTITY_NAME}#organizationId=${organizationId}`;

export const computeUserClassroomEntityLSI1Key = ({
  userId,
  classroomId,
  userType,
  identifier,
}: {
  userId?: string;
  userType: string;
  classroomId: string;
  identifier?: number;
}): string => {
  if (identifier === undefined) {
    return `classroomId=${classroomId}#userType=${userType}#`;
  }

  if (userId === undefined) {
    return `classroomId=${classroomId}#userType=${userType}#identifier=${identifier}#`;
  }

  return `classroomId=${classroomId}#userType=${userType}#identifier=${identifier}#userId=${userId}`;
};

export const computeUserClassroomEntitySortKey = ({
  userId,
  classroomId,
  userType,
}: {
  userId: string;
  userType: string;
  classroomId?: string;
}): string => {
  if (classroomId === undefined) {
    return `userId=${userId}#userType=${userType}#`;
  }

  return `userId=${userId}#userType=${userType}#classroomId=${classroomId}`;
};

export const UserClassroomEntity = new Entity({
  name: USER_CLASSROOM_ENTITY_NAME,
  schema: userClassroomSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ classroomId, userId, organizationId, userType }) => ({
    [PARTITION_KEY]: computeUserClassroomEntityPartitionKey({
      organizationId,
    }),
    [SORT_KEY]: computeUserClassroomEntitySortKey({
      userId,
      classroomId,
      userType,
    }),
  }),
});

export type UserClassroom = FormattedItem<typeof UserClassroomEntity>;
