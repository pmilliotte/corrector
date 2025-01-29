import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
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

    const Key = `users/${userId}/exams/${id}/subject.pdf`;

    await s3Client.send(
      new HeadObjectCommand({ Bucket: Resource['exam-bucket'].name, Key }),
    );

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
              eq: 'uploadSubject',
            },
          ],
        },
      })
      .send();
  });
