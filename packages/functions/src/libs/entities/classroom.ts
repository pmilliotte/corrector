import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { DIVISIONS } from '@corrector/shared';

import { OrganizationTable } from '../tables';

export const CLASSROOM_ENTITY_NAME = 'ClassRoom';

const classroomSchema = schema({
  id: string().key(),
  organizationId: string().key(),
  division: string()
    .enum(...DIVISIONS)
    .required(),
  schoolName: string().required(),
  classroomName: string().required(),
});

const computeClassroomEntityPartitionKey = ({
  organizationId,
}: {
  organizationId: string;
}): string => `${CLASSROOM_ENTITY_NAME}#organizationId=${organizationId}`;

export const computeClassroomEntitySortKey = ({ id }: { id: string }): string =>
  `classroomId=${id}`;

export const ClassroomEntity = new Entity({
  name: CLASSROOM_ENTITY_NAME,
  schema: classroomSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ id, organizationId }) => ({
    [PARTITION_KEY]: computeClassroomEntityPartitionKey({
      organizationId,
    }),
    [SORT_KEY]: computeClassroomEntitySortKey({
      id,
    }),
  }),
});

export type Classroom = FormattedItem<typeof ClassroomEntity>;
