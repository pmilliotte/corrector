import {
  boolean,
  Entity,
  FormattedItem,
  schema,
  string,
} from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../tables';

export const USER_ORGANIZATION_ENTITY_NAME = 'UserOrganization';

const userOrganizationSchema = schema({
  userId: string().key(),
  organizationId: string().key(),
  admin: boolean().default(false),
});
export const computeUserOrganizationEntitySortKey = ({
  userId,
  organizationId,
}: {
  userId: string;
  organizationId?: string;
}): string => {
  if (organizationId === undefined) {
    return `userId=${userId}#`;
  }

  return `userId=${userId}#organizationId=${organizationId}`;
};

export const UserOrganizationEntity = new Entity({
  name: USER_ORGANIZATION_ENTITY_NAME,
  schema: userOrganizationSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ userId, organizationId }) => ({
    [PARTITION_KEY]: USER_ORGANIZATION_ENTITY_NAME,
    [SORT_KEY]: computeUserOrganizationEntitySortKey({
      userId,
      organizationId,
    }),
  }),
});

export type UserOrganization = FormattedItem<typeof UserOrganizationEntity>;
