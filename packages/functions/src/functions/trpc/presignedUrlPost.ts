import { TRPCError } from '@trpc/server';
import { Resource } from 'sst';
import { z } from 'zod';

import { EXAM_BLANK, EXAM_RESPONSE } from '@corrector/shared';

import {
  getFileExtension,
  getFileKeyPrefix,
  getFileSUpposedContentType,
  requestSignedUrlPost,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const presignedUrlPost = authedProcedure
  .input(
    z
      .object({
        fileName: z.string(),
        organizationId: z.string(),
        examId: z.string(),
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
  .mutation(
    async ({
      ctx: { session },
      input: { fileName, organizationId, examId, ...file },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId }, session);

      const { id: userId } = session;
      const fileExtension = getFileExtension(fileName);
      const contentType =
        fileExtension !== undefined
          ? getFileSUpposedContentType(fileExtension)
          : undefined;

      if (contentType === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const fileKey = `${getFileKeyPrefix({ organizationId, userId, examId, ...file })}/file.${fileExtension}`;
      // Metadata arguments must start with x-amz-meta and be written in kebab case
      const metadata = {
        'x-amz-meta-original-file-name': encodeURIComponent(fileName),
        'x-amz-meta-uploaded-by': userId,
        ...(file.fileType === EXAM_RESPONSE
          ? { 'x-amz-meta-created-uuid': file.fileId }
          : {}),
      };

      const { url, fields } = await requestSignedUrlPost({
        contentType,
        fileKey,
        metadata,
        bucketName: Resource['exam-bucket'].name,
      });

      return {
        url,
        fields,
        id: file.fileType === EXAM_RESPONSE ? file.fileId : 'subject',
      };
    },
  );
