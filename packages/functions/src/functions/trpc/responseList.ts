import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  computeResponseEntitySortKey,
  ExamTable,
  ResponseEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const responseList = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      examId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { organizationId, examId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId: examId }, session);

    const query: Query<typeof ExamTable> = {
      partition: ResponseEntity.name,
      range: {
        beginsWith: computeResponseEntitySortKey({
          organizationId,
          examId,
        }),
      },
    };

    const { Items: responses } = await ExamTable.build(QueryCommand)
      .query(query)
      .entities(ResponseEntity)
      .send();

    if (responses === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    return {
      responses: responses.map(
        ({ [$entity]: _entityName, ...restOfResponse }) => restOfResponse,
      ),
    };
  });
