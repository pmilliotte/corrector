import { TRPCError } from '@trpc/server';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import compact from 'lodash/compact';
import { z } from 'zod';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examConfigureProblems = authedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { id } }) => {
    const { id: userId } = session;

    const { Item: exam } = await ExamEntity.build(GetItemCommand)
      .key({ id, userId })
      .send();

    if (exam === undefined) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    const {
      problems: { uploadFiles },
    } = exam;

    const configureProblems = compact(Object.values(uploadFiles)).reduce(
      (acc, problems) => ({
        ...acc,
        ...problems,
      }),
      {},
    );

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id,
        userId,
        status: 'configureProblems',
        problems: {
          uploadFiles: $set({}),
          configureProblems: $set(configureProblems),
        },
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
              eq: 'uploadFiles',
            },
          ],
        },
      })
      .send();
  });
