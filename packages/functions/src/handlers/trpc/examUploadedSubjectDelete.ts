import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { authedProcedure } from '~/trpc';

export const examUploadedSubjectDelete = authedProcedure
  .input(
    z.object({
      examId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { examId } }) => {
    const { id: userId } = session;

    const deleteCommand = new DeleteObjectCommand({
      Bucket: Resource['exam-bucket'].name,
      Key: `users/${userId}/exams/${examId}/subject.pdf`,
    });
    await s3Client.send(deleteCommand);
  });
