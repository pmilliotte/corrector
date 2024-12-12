import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { EXAM_BLANK, EXAM_RESPONSE } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getFileName,
  requestSignedUrlGet,
  validateExamOwnership,
} from '../libs';

export const presignedUrlGet = authedProcedure
  .input(
    z
      .object({
        examId: z.string(),
        organizationId: z.string(),
      })
      .and(
        z
          .object({
            fileType: z.literal(EXAM_BLANK),
            fileId: z.string().optional(),
          })
          .or(
            z.object({
              fileType: z.literal(EXAM_RESPONSE),
              fileId: z.string(),
            }),
          ),
      ),
  )
  .query(
    async ({
      ctx: { session },
      input: { organizationId, examId, ...file },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;

      const fileName = getFileName({
        organizationId,
        userId,
        examId,
        ...file,
      });

      const url = await requestSignedUrlGet({
        fileKey: fileName,
        bucketName: Bucket['exam-bucket'].bucketName,
      });

      return url;
    },
  );
