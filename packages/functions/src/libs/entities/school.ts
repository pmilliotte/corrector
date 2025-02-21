import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../tables';

export const SCHOOL_ENTITY_NAME = 'School';

const schoolSchema = schema({
  id: string().key(),
  organizationId: string().key(),
  name: string().required(),
  uai: string().optional(),
  city: string(),
  pseudo: string(),
});

export const computeSchoolEntityPartitionKey = ({
  organizationId,
}: {
  organizationId: string;
}): string => `${SCHOOL_ENTITY_NAME}#organizationId=${organizationId}`;

export const computeSchoolEntitySortKey = ({ id }: { id: string }): string =>
  `schoolId=${id}`;

export const SchoolEntity = new Entity({
  name: SCHOOL_ENTITY_NAME,
  schema: schoolSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ id, organizationId }) => ({
    [PARTITION_KEY]: computeSchoolEntityPartitionKey({
      organizationId,
    }),
    [SORT_KEY]: computeSchoolEntitySortKey({
      id,
    }),
  }),
});

export type School = FormattedItem<typeof SchoolEntity>;
