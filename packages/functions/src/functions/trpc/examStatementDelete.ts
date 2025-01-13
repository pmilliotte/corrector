import { $remove, UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examStatementDelete = authedProcedure
  .input(
    z.object({
      index: z.number(),
      problemId: z.string(),
      examId: z.string(),
    }),
  )
  .mutation(
    async ({ ctx: { session }, input: { index, problemId, examId } }) => {
      const { id: userId } = session;

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            configureProblems: {
              [problemId]: {
                content: {
                  [index]: $remove(),
                },
              },
            },
          },
        })
        .options({
          condition: {
            attr: 'id',
            exists: true,
          },
        })
        .send();
    },
  );
