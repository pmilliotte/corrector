import { Entity, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../table';

export const ORGANIZATION_ENTITY_NAME = 'Organization';

const organizationSchema = schema({
  id: string().key(),
  name: string().required(),
});

export const OrganizationEntity = new Entity({
  name: ORGANIZATION_ENTITY_NAME,
  schema: organizationSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ id }) => ({
    [PARTITION_KEY]: ORGANIZATION_ENTITY_NAME,
    [SORT_KEY]: `organizationId=${id}`,
  }),
});

export type Organization = typeof organizationSchema;
