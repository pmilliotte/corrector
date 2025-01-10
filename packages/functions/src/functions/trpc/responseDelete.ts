import { DeleteItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_RESPONSE } from '@corrector/shared';

import {
  deleteObjects,
  getFileKeyPrefix,
  ResponseEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

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
      await validateExamOwnership({ examId }, session);

      const { id: userId } = session;

      await ResponseEntity.build(DeleteItemCommand)
        .key({
          id: responseId,
          organizationId,
          examId,
        })
        .send();

      await deleteObjects({
        bucketName: Resource['exam-bucket'].name,
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
