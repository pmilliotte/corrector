import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSetReady = authedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { id } }) => {
    const { id: userId } = session;

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id,
        userId,
        status: 'ready',
      })
      .options({
        condition: {
          and: [
            {
              attr: 'id',
              exists: true,
            },
            {
              attr: 'status',
              eq: 'configureProblems',
            },
          ],
        },
      })
      .send();
  });
