import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { FILE_TYPES, FileType } from '@corrector/shared';

import { s3Client } from '~/clients';
import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getFileKeyPrefix,
  requestSignedUrlGet,
  validateExamOwnership,
} from '../libs';

export const examFilesGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { id, organizationId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId: id, organizationId }, session);

    const filePrefix = getFileKeyPrefix({
      organizationId,
      userId: session.id,
      examId: id,
    });

    const { Contents: files = [] } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: Bucket['exam-bucket'].bucketName,
        Prefix: filePrefix,
      }),
    );

    const fileNames = await FILE_TYPES.reduce<
      Promise<
        Partial<Record<FileType, { originalFileName: string; url: string }>>
      >
    >(async (accP, fileType) => {
      const acc = await accP;
      const key = `${filePrefix}/${fileType}.pdf`;
      if (!files.map(({ Key }) => Key).includes(key)) {
        return acc;
      }

      const [{ Metadata: metadata }, url] = await Promise.all([
        s3Client.send(
          new HeadObjectCommand({
            Bucket: Bucket['exam-bucket'].bucketName,
            Key: key,
          }),
        ),
        requestSignedUrlGet({
          fileKey: key,
          bucketName: Bucket['exam-bucket'].bucketName,
        }),
      ]);

      return {
        ...acc,
        [fileType]: { originalFileName: metadata?.['original-file-name'], url },
      };
    }, Promise.resolve({}));

    return fileNames;
  });