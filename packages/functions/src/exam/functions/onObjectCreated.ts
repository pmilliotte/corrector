import { S3Event } from 'aws-lambda';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';

import { EXAM_BLANK, EXAM_BLANK_PATH_SUFFIX } from '@corrector/shared';

import { ExamEntity } from '../libs';
import { savePdfToImages } from '../libs/conversion';
import { parseKeyPrefix } from '../libs/utils/getFileKeyPrefix';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;
      if (!objectKey.endsWith(EXAM_BLANK_PATH_SUFFIX)) {
        return;
      }

      const prefix = objectKey.split(EXAM_BLANK_PATH_SUFFIX)[0];

      const { organizationId, examId } = parseKeyPrefix(prefix);

      await savePdfToImages({
        bucketName: Bucket['exam-bucket'].bucketName,
        fileType: EXAM_BLANK,
        prefix,
      });

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status: 'imagesUploaded' })
        .send();
    }),
  );
};
