import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { FILE_TYPES, PDF_FILE_NAME } from '@corrector/shared';

import { s3Client } from '~/clients';
import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import { getFileKeyPrefix, validateExamOwnership } from '../libs';

export const examFileDelete = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
      fileType: z.enum(FILE_TYPES),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, examId, fileType },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;

      const filePrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
      });

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: Bucket['exam-bucket'].bucketName,
          Key: `${filePrefix}/${fileType}/${PDF_FILE_NAME}.pdf`,
        }),
      );

      return;
    },
  );
