import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { id } }) => {
    const { id: userId } = session;

    const { Item: exam } = await ExamEntity.build(GetItemCommand)
      .key({ id, userId })
      .send();

    if (exam === undefined) {
      throw new TRPCError({ code: 'NOT_FOUND' });
    }

    return exam;
  });
