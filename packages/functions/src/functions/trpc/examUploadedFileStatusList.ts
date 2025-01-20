import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Resource } from 'sst';
import { z } from 'zod';

import { isExamUploadedFileStatus } from '@corrector/shared';

import { s3Client } from '~/clients';
import { validateExamOwnership } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examUploadedFileStatusList = authedProcedure
  .input(
    z.object({
      examId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { examId } }) => {
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;

    const prefix = `users/${userId}/exams/${examId}/uploadedFiles/`;

    const bucketName = Resource['exam-bucket'].name;

    const { Contents: uploadedFiles = [] } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        Prefix: prefix,
      }),
    );

    const statuses = await Promise.all(
      uploadedFiles
        .sort((a, b) => (a.Key ?? '').localeCompare(b.Key ?? ''))
        .map(async ({ Key }) => {
          if (Key === undefined) {
            throw new Error();
          }

          const fileName = Key.replace(prefix, '');

          const { Metadata } = await s3Client.send(
            new HeadObjectCommand({
              Bucket: bucketName,
              Key,
            }),
          );

          const fileStatus = Metadata?.['file-status'];

          if (
            fileStatus === undefined ||
            !isExamUploadedFileStatus(fileStatus)
          ) {
            throw new Error();
          }

          return { fileName, status: fileStatus };
        }),
    );

    return statuses;
  });
