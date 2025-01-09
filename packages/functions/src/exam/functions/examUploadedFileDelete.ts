import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { $remove, UpdateItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { authedProcedure } from '~/trpc';

import { ExamEntity } from '../libs';

export const examUploadedFileDelete = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      fileName: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { fileName, examId } }) => {
    const { id: userId } = session;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: Bucket['exam-bucket'].bucketName,
      Key: `users/${userId}/exams/${examId}/uploadedFiles/${fileName}`,
    });
    await s3Client.send(deleteCommand);

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id: examId,
        userId,
        problems: {
          [fileName]: $remove(),
        },
      })
      .send();
  });
