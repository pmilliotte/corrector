import { DeleteItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  deleteObjects,
  getFileKeyPrefix,
  ResponseEntity,
  validateExamOwnership,
} from '../libs';

export const responseDelete = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
      examId: z.string(),
      responseId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, examId, responseId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;

      console.log({
        id: responseId,
        organizationId,
        examId,
      });

      await ResponseEntity.build(DeleteItemCommand)
        .key({
          id: responseId,
          organizationId,
          examId,
        })
        .send();

      await deleteObjects({
        bucketName: Bucket['exam-bucket'].bucketName,
        prefix: getFileKeyPrefix({
          organizationId,
          userId,
          examId,
          fileType: EXAM_RESPONSE,
          fileId: responseId,
        }),
      });

      return;
    },
  );
