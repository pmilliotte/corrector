import { TRPCError } from '@trpc/server';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { FILE_TYPES } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  getFileExtension,
  getFileKeyPrefix,
  getFileSUpposedContentType,
  requestSignedUrl,
  validateExamOwnership,
} from '../libs';

export const presignedUrlGet = authedProcedure
  .input(
    z.object({
      fileName: z.string(),
      organizationId: z.string(),
      fileType: z.enum(FILE_TYPES),
      examId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { fileName, organizationId, fileType, examId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId, organizationId }, session);

      const { id: userId } = session;
      const fileExtension = getFileExtension(fileName);
      const contentType =
        fileExtension !== undefined
          ? getFileSUpposedContentType(fileExtension)
          : undefined;

      if (contentType === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const fileKey = `${getFileKeyPrefix({ organizationId, userId, examId })}/${fileType}.${fileExtension}`;
      // Metadata arguments must start with x-amz-meta and be written in kebab case
      const metadata = {
        'x-amz-meta-original-file-name': fileName,
        'x-amz-meta-uploaded-by': userId,
      };

      const { url, fields } = await requestSignedUrl({
        contentType,
        fileKey,
        metadata,
        bucketName: Bucket['exam-bucket'].bucketName,
      });

      return { url, fields };
    },
  );
