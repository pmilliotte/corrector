import { Table } from 'dynamodb-toolbox';
import { Table as SstTable } from 'sst/node/table';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { documentClient } from '~/clients';

export const ExamTable = new Table({
  name: SstTable['exam-table'].tableName,
  partitionKey: { name: PARTITION_KEY, type: 'string' },
  sortKey: { name: SORT_KEY, type: 'string' },
  documentClient,
});
