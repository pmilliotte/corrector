import { TRPCError } from '@trpc/server';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import { authedProcedure } from '~/trpc';

import {
  getFileExtension,
  getFileSUpposedContentType,
  Metadata,
  requestSignedUrlPost,
  validateExamOwnership,
} from '../libs';

export const examUploadedFilePresignedUrlPost = authedProcedure
  .input(
    z.object({
      fileName: z.string(),
      examId: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { fileName, examId } }) => {
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

    const fileKey = `users/${userId}/exams/${examId}/uploadedFiles/${Date.now()}.${fileExtension}`;
    // Metadata arguments must start with x-amz-meta and be written in kebab case
    const metadata: Metadata = {
      'x-amz-meta-original-file-name': encodeURIComponent(fileName),
      'x-amz-meta-file-status': 'uploaded',
    };

    const { url, fields } = await requestSignedUrlPost({
      contentType,
      fileKey,
      metadata,
      bucketName: Bucket['exam-bucket'].bucketName,
    });

    return {
      url,
      fields,
    };
  });
