import { TRPCError } from '@trpc/server';
import { Resource } from 'sst';
import { z } from 'zod';

import {
  getFileExtension,
  getFileSUpposedContentType,
  Metadata,
  requestSignedUrlPost,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomExamUploadedFilePresignedUrlPost = authedProcedure
  .input(
    z.object({
      fileName: z.string(),
      examId: z.string(),
      classroomId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { fileName, examId, classroomId, organizationId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId }, session);

      const fileExtension = getFileExtension(fileName);

      if (fileExtension === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const contentType = getFileSUpposedContentType(fileExtension);

      if (contentType === undefined || fileExtension !== 'pdf') {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const fileKey = `organizations/${organizationId}/classrooms/${classroomId}/exams/${examId}/answers.pdf`;
      // Metadata arguments must start with x-amz-meta and be written in kebab case
      const metadata: Metadata = {
        'x-amz-meta-original-file-name': encodeURIComponent(fileName),
      };

      const { url, fields } = await requestSignedUrlPost({
        contentType,
        fileKey,
        metadata,
        bucketName: Resource['exam-bucket'].name,
      });

      return { url, fields };
    },
  );
