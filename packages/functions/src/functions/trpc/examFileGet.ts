import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_BLANK, EXAM_RESPONSE } from '@corrector/shared';

import {
  getFileName,
  requestSignedUrlGet,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examFileGet = authedProcedure
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
      input: { examId, organizationId, ...file },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId }, session);

      const fileName = getFileName({
        organizationId,
        userId: session.id,
        examId,
        ...file,
      });

      const url = await requestSignedUrlGet({
        fileKey: fileName,
        bucketName: Resource['exam-bucket'].name,
      });

      return { url };
    },
  );
