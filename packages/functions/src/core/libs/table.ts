import { Table } from 'dynamodb-toolbox';
import { Table as SstTable } from 'sst/node/table';

import { documentClient } from '~/clients';

export const UserTable: Table<string, 'id', null> = new Table({
  name: SstTable.user.tableName,
  partitionKey: 'id',
  DocumentClient: documentClient,
});
