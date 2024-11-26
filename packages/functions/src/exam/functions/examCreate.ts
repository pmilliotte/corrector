import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { SUBJECTS } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { ExamEntity } from '../libs';

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

      const id = crypto.randomUUID();

      await ExamEntity.build(PutItemCommand)
        .item({
          id,
          name,
          organizationId,
          subject,
          userId,
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
