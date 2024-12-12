import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { EXAM_BLANK } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  deleteObjects,
  ExamEntity,
  getFileKeyPrefix,
  validateExamOwnership,
} from '../libs';

export const examSubjectDelete = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { organizationId, examId } }) => {
    validateOrganizationAccess(organizationId, session);
    await validateExamOwnership({ examId, organizationId }, session);

    const { id: userId } = session;

    await ExamEntity.build(UpdateItemCommand)
      .item({ id: examId, organizationId, status: 'toBeUploaded' })
      .send();

    await deleteObjects({
      bucketName: Bucket['exam-bucket'].bucketName,
      prefix: getFileKeyPrefix({
        organizationId,
        userId,
        examId,
        fileType: EXAM_BLANK,
      }),
    });

    return;
  });
