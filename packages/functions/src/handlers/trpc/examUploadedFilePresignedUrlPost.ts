import { TRPCError } from '@trpc/server';
import { $set, UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';
import { z } from 'zod';

import {
  ExamEntity,
  getFileExtension,
  getFileSUpposedContentType,
  Metadata,
  requestSignedUrlPost,
  validateExamOwnership,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examUploadedFilePresignedUrlPost = authedProcedure
  .input(
    z.object({
      fileName: z.string(),
      examId: z.string(),
      type: z.enum(['uploadFiles', 'uploadSubject']),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { fileName, examId, type } }) => {
    await validateExamOwnership({ examId }, session);

    const { id: userId } = session;
    const fileExtension = getFileExtension(fileName);

    if (fileExtension === undefined) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    const contentType = getFileSUpposedContentType(fileExtension);

    if (
      contentType === undefined ||
      (type === 'uploadSubject' && fileExtension !== 'pdf') ||
      (type === 'uploadFiles' && !['jpg', 'png'].includes(fileExtension))
    ) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    if (type === 'uploadSubject') {
      const fileKey = `users/${userId}/exams/${examId}/subject.pdf`;
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
    }

    const fileDateWithExtension = `${Date.now()}.${fileExtension}`;

    const fileKey = `users/${userId}/exams/${examId}/uploadedFiles/${fileDateWithExtension}`;
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

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id: examId,
        userId,
        problems: {
          uploadFiles: {
            [fileDateWithExtension]: $set({
              status: 'uploadRequested',
              problem: undefined,
            }),
          },
        },
      })
      .options({
        condition: {
          and: [
            {
              attr: 'id',
              exists: true,
            },
            {
              attr: 'status',
              eq: 'uploadFiles',
            },
          ],
        },
      })
      .send();

    return {
      url,
      fields,
    };
  });
