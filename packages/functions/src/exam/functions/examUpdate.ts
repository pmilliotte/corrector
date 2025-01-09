import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { EXAM_STATUSES } from '@corrector/shared';

import { authedProcedure } from '~/trpc';

import { ExamEntity } from '../libs';

export const examUpdate = authedProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(EXAM_STATUSES),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { id, status } }) => {
    const { id: userId } = session;

    await ExamEntity.build(UpdateItemCommand)
      .item({ id, userId, status })
      .options({
        condition: {
          attr: 'id',
          exists: true,
        },
      })
      .send();
  });
