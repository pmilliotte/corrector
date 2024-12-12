import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  computeResponseEntitySortKey,
  ExamTable,
  ResponseEntity,
  validateExamOwnership,
} from '../libs';

export const responseList = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      examId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { organizationId, examId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId: examId, organizationId }, session);
    console.log('responsesList');

    const query: Query<typeof ExamTable> = {
      partition: ResponseEntity.name,
      range: {
        beginsWith: computeResponseEntitySortKey({
          organizationId,
          examId,
        }),
      },
    };

    console.log('query');
    const { Items: responses } = await ExamTable.build(QueryCommand)
      .query(query)
      .entities(ResponseEntity)
      .send();

    console.log('responses', responses);
    if (responses === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    console.log('responses', responses);

    return {
      responses: responses.map(
        ({ [$entity]: _entityName, ...restOfResponse }) => restOfResponse,
      ),
    };
  });
