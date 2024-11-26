import { Entity, schema, string } from 'dynamodb-toolbox';

import { LSI1_SK, PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../table';

export const USER_ENTITY_NAME = 'User';

const userSchema = schema({
  id: string().key(),
  email: string().required(),
  sub: string().optional(),
}).and(prevSchema => ({
  selectedOrganizationId: string().link<typeof prevSchema>(({ id }) => id),
  [LSI1_SK]: string().link<typeof prevSchema>(({ email }) =>
    computeUserEntityLSI1SortKey({ email }),
  ),
}));

export const computeUserEntityLSI1SortKey = ({
  email,
}: {
  email: string;
}): string => `userEmail=${email}`;

export const UserEntity = new Entity({
  name: USER_ENTITY_NAME,
  schema: userSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ id }) => ({
    [PARTITION_KEY]: USER_ENTITY_NAME,
    [SORT_KEY]: `userId=${id}`,
  }),
});

export type User = typeof userSchema;
