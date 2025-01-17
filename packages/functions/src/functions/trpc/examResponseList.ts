import { HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import { s3Client } from '~/clients';
import {
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examResponseList = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { examId, organizationId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId }, session);

    const filePrefix = getFileKeyPrefix({
      organizationId,
      userId: session.id,
      examId,
      fileType: EXAM_RESPONSE,
    });

    const { Contents: files = [] } = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: Resource['exam-bucket'].name,
        Prefix: `${filePrefix}/`,
      }),
    );

    const filesInfo = await Promise.all(
      files.map(({ Key }) => {
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
          .then(({ Metadata }) => ({
            id: getResponseIdFromKey(Key),
            originalFileName:
              Metadata?.['original-file-name'] !== undefined
                ? decodeURIComponent(Metadata['original-file-name'])
                : undefined,
          }));
      }),
    );

    return filesInfo;
  });

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
