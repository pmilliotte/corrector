import { S3Event } from 'aws-lambda';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';

import { EXAM_BLANK, PDF_FILE_NAME } from '@corrector/shared';

import { ExamEntity, parseKey, ResponseEntity, savePdfToImages } from '~/libs';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;

      const prefix = objectKey.split(`/${PDF_FILE_NAME}.pdf`)[0];

      const { organizationId, examId, fileType } = parseKey(objectKey);

      const { id, originalFileName, uploadedAt } = await savePdfToImages({
        bucketName: Resource['exam-bucket'].name,
        prefix,
      });

      if (originalFileName === undefined || uploadedAt === undefined) {
        throw new Error();
      }

      if (fileType === EXAM_BLANK) {
        await ExamEntity.build(UpdateItemCommand)
          .item({
            id: examId,
            organizationId,
            status: 'imagesUploaded',
            subjectFileName: originalFileName,
            subjectUploadedAt: uploadedAt,
          })
          .send();

        return;
      }

      if (id === undefined) {
        throw new Error();
      }

      await ResponseEntity.build(UpdateItemCommand)
        .item({
          id,
          filename: originalFileName,
          uploadedAt,
          examId,
          organizationId,
          status: 'imagesUploaded',
        })
        .send();
    }),
  );
};
