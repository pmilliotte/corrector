import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_BLANK } from '@corrector/shared';

import {
  deleteObjects,
  ExamEntity,
  getFileKeyPrefix,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examSubjectDelete = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { organizationId, examId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;

    await ExamEntity.build(UpdateItemCommand)
      .item({ id: examId, organizationId, status: 'toBeUploaded' })
      .send();

    await deleteObjects({
      bucketName: Resource['exam-bucket'].name,
      prefix: getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_BLANK,
      }),
    });

    return;
  });
