import { S3Event } from 'aws-lambda';
import { Bucket } from 'sst/node/bucket';

import { EXAM_BLANK, EXAM_BLANK_PATH_SUFFIX } from '@corrector/shared';

import { savePdfToImages } from '../libs/conversion';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;
      if (!objectKey.endsWith(EXAM_BLANK_PATH_SUFFIX)) {
        return;
      }

      const prefix = objectKey.split(EXAM_BLANK_PATH_SUFFIX)[0];

      await savePdfToImages({
        bucketName: Bucket['exam-bucket'].bucketName,
        fileType: EXAM_BLANK,
        prefix,
      });
    }),
  );
};
