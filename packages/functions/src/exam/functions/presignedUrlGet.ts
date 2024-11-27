import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { FILE_TYPES } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getFileKeyPrefix,
  requestSignedUrlGet,
  validateExamOwnership,
} from '../libs';

export const presignedUrlGet = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      fileType: z.enum(FILE_TYPES),
      examId: z.string(),
    }),
  )
  .query(
    async ({
      ctx: { session },
      input: { organizationId, fileType, examId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;

      const fileKey = `${getFileKeyPrefix({ organizationId, userId, examId })}/${fileType}.pdf`;

      const url = await requestSignedUrlGet({
        bucketName: Bucket['exam-bucket'].bucketName,
        fileKey,
      });

      return url;
    },
  );
