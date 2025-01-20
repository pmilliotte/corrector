import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { validateExamOwnership } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSubjectPresignedUrlGet = authedProcedure
  .input(
    z.object({
      examId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { examId } }) => {
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;

    const Key = `users/${userId}/exams/${examId}/subject.pdf`;

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: Resource['exam-bucket'].name,
        Key,
      }),
      { expiresIn: 300 },
    );

    return url;
  });
