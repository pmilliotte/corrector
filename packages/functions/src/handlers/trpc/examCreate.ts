import { randomUUID } from 'crypto';
import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { SUBJECTS } from '@corrector/shared';

import { ExamEntity, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examCreate = authedProcedure
  .input(
    z.object({
      name: z.string(),
      organizationId: z.string(),
      subject: z.enum(SUBJECTS),
    }),
  )
  .mutation(
    async ({ ctx: { session }, input: { name, organizationId, subject } }) => {
      validateOrganizationAccess(organizationId, session);

      const { id: userId } = session;

      const id = randomUUID();

      await ExamEntity.build(PutItemCommand)
        .item({
          id,
          name,
          subject,
          userId,
          organizationId,
          status: 'uploadFiles',
          problems: { uploadFiles: {}, configureProblems: [] },
        })
        .options({
          condition: {
            attr: 'id',
            exists: false,
          },
        })
        .send();

      return { id };
    },
  );
