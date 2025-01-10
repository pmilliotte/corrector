import { Table } from 'dynamodb-toolbox';
import { Resource } from 'sst';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { documentClient } from '~/clients';

export const ExamTable = new Table({
  name: Resource['exam-table'].name,
  partitionKey: { name: PARTITION_KEY, type: 'string' },
  sortKey: { name: SORT_KEY, type: 'string' },
  documentClient,
});
