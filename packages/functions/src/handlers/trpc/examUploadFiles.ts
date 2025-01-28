import { UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examUploadFiles = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      status: z.enum(['uploadFiles', 'uploadSubject']),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { examId, status } }) => {
    const { id: userId } = session;

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id: examId,
        userId,
        status,
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
              eq: 'created',
            },
          ],
        },
      })
      .send();
  });
