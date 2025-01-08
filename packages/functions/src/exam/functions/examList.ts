import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';

import { authedProcedure } from '~/trpc';

import { computeExamEntitySortKey, ExamEntity, ExamTable } from '../libs';

export const examList = authedProcedure.query(async ({ ctx: { session } }) => {
  const { id: userId } = session;

  const query: Query<typeof ExamTable> = {
    partition: ExamEntity.name,
    range: {
      beginsWith: computeExamEntitySortKey({
        userId,
      }),
    },
  };

  const { Items: exams } = await ExamTable.build(QueryCommand)
    .query(query)
    .entities(ExamEntity)
    .send();

  if (exams === undefined) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
  }

  return exams.map(({ [$entity]: _entityName, ...restOfExam }) => restOfExam);
});
