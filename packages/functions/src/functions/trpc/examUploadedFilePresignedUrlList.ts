import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { requestSignedUrlGet, validateExamOwnership } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examUploadedFilePresignedUrlList = authedProcedure
  .input(
    z.object({
      examId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { examId } }) => {
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;

    const prefix = `users/${userId}/exams/${examId}/uploadedFiles/`;

    const { Contents: uploadedFiles = [] } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: Resource['exam-bucket'].name,
        Prefix: prefix,
      }),
    );

    const urls = await Promise.all(
      uploadedFiles
        .sort((a, b) => (a.Key ?? '').localeCompare(b.Key ?? ''))
        .map(async ({ Key }) => {
          if (Key === undefined) {
            throw new Error();
          }

          const fileName = Key.replace(prefix, '');

          const url = await requestSignedUrlGet({
            fileKey: Key,
            bucketName: Resource['exam-bucket'].name,
          });

          if (url === undefined) {
            throw new Error();
          }

          return { fileName, url };
        }),
    );

    return urls;
  });
