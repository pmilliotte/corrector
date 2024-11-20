import { Entity, EntityItem } from 'dynamodb-toolbox';

import { UserTable } from '../table';

export const USER_ENTITY_NAME = 'User';

export const UserEntity = new Entity({
  name: USER_ENTITY_NAME,
  attributes: {
    id: { partitionKey: true, type: 'string' },
    admin: { type: 'boolean', required: true, default: false },
    selectedOrganizationId: {
      type: 'string',
      required: true,
      default: ({ id }: { id: string }) => id,
    },
  },
  table: UserTable,
} as const);

export type User = EntityItem<typeof UserEntity>;
