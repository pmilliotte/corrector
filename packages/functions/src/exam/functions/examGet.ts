import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { authedProcedure } from '~/trpc';

import { ExamEntity } from '../libs';

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
