import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { SUBJECTS } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { computeExamEntitySortKey, ExamEntity, ExamTable } from '../libs';

export const examList = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      subject: z.enum(SUBJECTS),
    }),
  )
  .query(async ({ ctx: { session }, input: { organizationId } }) => {
    validateOrganizationAccess(organizationId, session);

    const query: Query<typeof ExamTable> = {
      partition: ExamEntity.name,
      range: {
        beginsWith: computeExamEntitySortKey({
          organizationId,
        }),
      },
    };

    const { Items: exams } = await ExamTable.build(QueryCommand)
      .query(query)
      .entities(ExamEntity)
      .send();

    console.log('exams', exams);

    if (exams === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    return {
      exams: exams.map(
        ({ [$entity]: _entityName, ...restOfExam }) => restOfExam,
      ),
    };
  });
