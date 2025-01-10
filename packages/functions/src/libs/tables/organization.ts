import { Table } from 'dynamodb-toolbox';
import { Resource } from 'sst';

import {
  LSI1,
  LSI1_SK,
  PARTITION_KEY,
  SORT_KEY,
} from '@corrector/backend-shared';

import { documentClient } from '~/clients';

export const OrganizationTable = new Table({
  name: Resource['organization-table'].name,
  partitionKey: { name: PARTITION_KEY, type: 'string' },
  sortKey: { name: SORT_KEY, type: 'string' },
  indexes: {
    [LSI1]: {
      type: 'local',
      sortKey: { name: LSI1_SK, type: 'string' },
    },
  },
  documentClient,
});
