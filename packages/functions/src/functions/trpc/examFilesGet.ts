import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import { s3Client } from '~/clients';
import {
  getExamBlankFileName,
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examFilesGet = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { examId: examId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId: examId }, session);

      const filePrefix = getFileKeyPrefix({
        organizationId,
        userId: session.id,
        examId: examId,
        fileType: EXAM_RESPONSE,
      });

      const { Contents: responses = [] } = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: Resource['exam-bucket'].name,
          Prefix: `${filePrefix}/`,
        }),
      );

      const files = await Promise.all([
        s3Client
          .send(
            new HeadObjectCommand({
              Bucket: Resource['exam-bucket'].name,
              Key: getExamBlankFileName({
                organizationId,
                userId: session.id,
                examId: examId,
              }),
            }),
          )
          .then(({ Metadata, LastModified }) => ({
            id: 'subject' as const,
            originalFileName:
              Metadata?.['original-file-name'] !== undefined
                ? decodeURIComponent(Metadata['original-file-name'])
                : undefined,
            lastModified: LastModified,
          })),
        ...responses.map(({ Key }) => {
          if (Key === undefined) {
            throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
          }

          return s3Client
            .send(
              new HeadObjectCommand({
                Bucket: Resource['exam-bucket'].name,
                Key,
              }),
            )
            .then(({ Metadata, LastModified }) => ({
              id: getResponseIdFromKey(Key),
              originalFileName:
                Metadata?.['original-file-name'] !== undefined
                  ? decodeURIComponent(Metadata['original-file-name'])
                  : undefined,
              lastModified: LastModified,
            }));
        }),
      ]);

      return files;
    },
  );

const EXAM_RESPONSE_KEY_REGEXP = new RegExp(
  `^organizations/[0-9a-fA-F-]{36}/users/[0-9a-fA-F-]{36}/exams/[0-9a-fA-F-]{36}/${EXAM_RESPONSE}/([0-9a-fA-F-]{36})/file.pdf$`,
);

const getResponseIdFromKey = (key: string): string => {
  const match = EXAM_RESPONSE_KEY_REGEXP.exec(key);

  if (match === null) {
    throw new Error();
  }

  const [_, responseId] = match;

  return responseId;
};
