import { S3Event } from 'aws-lambda';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';

import { EXAM_BLANK, EXAM_BLANK_PATH_SUFFIX } from '@corrector/shared';

import { ExamEntity, parseKeyPrefix } from '../libs';
import { deleteOjects } from '../libs/utils/s3';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;
      if (!objectKey.endsWith(EXAM_BLANK_PATH_SUFFIX)) {
        return;
      }

      const prefix = objectKey.split(EXAM_BLANK_PATH_SUFFIX)[0];

      const { organizationId, examId } = parseKeyPrefix(prefix);

      await deleteOjects({
        bucketName: Bucket['exam-bucket'].bucketName,
        prefix: `${prefix}/${EXAM_BLANK}/images`,
      });

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status: 'subject' })
        .send();
    }),
  );
};
