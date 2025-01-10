import { randomUUID } from 'crypto';
import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  ResponseEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const responseCreate = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      examId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { organizationId, examId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;

    const id = randomUUID();

    await ResponseEntity.build(PutItemCommand)
      .item({
        id,
        organizationId,
        userId,
        examId,
        status: 'toBeUploaded',
      })
      .options({
        condition: {
          attr: 'id',
          exists: false,
        },
      })
      .send();

    return { id };
  });
