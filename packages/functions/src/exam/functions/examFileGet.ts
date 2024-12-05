import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { FILE_TYPES, PDF_FILE_NAME } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getFileKeyPrefix,
  requestSignedUrlGet,
  validateExamOwnership,
} from '../libs';

export const examFileGet = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
      fileType: z.enum(FILE_TYPES),
    }),
  )
  .query(
    async ({ ctx: { session }, input: { id, organizationId, fileType } }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId: id, organizationId }, session);

      const filePrefix = getFileKeyPrefix({
        organizationId,
        userId: session.id,
        examId: id,
      });

      const url = await requestSignedUrlGet({
        fileKey: `${filePrefix}/${fileType}/${PDF_FILE_NAME}.pdf`,
        bucketName: Bucket['exam-bucket'].bucketName,
      });

      return { url };
    },
  );
