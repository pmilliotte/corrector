import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import {
  savePdfToImages,
  validateClassroomWriteAccess,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const pdfSplitToImages = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, examId, classroomId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateClassroomWriteAccess(
        { organizationId, classroomId },
        session,
      );

      const fileKeyPrefix = `organizations/${organizationId}/classrooms/${classroomId}/exams/${examId}`;

      const { LastModified } = await s3Client.send(
        new HeadObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: `${fileKeyPrefix}/answers.pdf`,
        }),
      );

      if (LastModified === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      await savePdfToImages({
        key: `${fileKeyPrefix}/answers.pdf`,
        destination: `${fileKeyPrefix}/answers-as-images/${LastModified.toISOString()}`,
        bucketName: Resource['exam-bucket'].name,
      });
    },
  );
