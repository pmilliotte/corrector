import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Bucket } from 'sst/node/bucket';
import { Readable } from 'stream';

import { streamToString } from '@corrector/backend-shared';
import {
  EXAM_BLANK,
  ExamAnalysis,
  examAnalysisSchema,
} from '@corrector/shared';

import { s3Client } from '~/clients';

export const getAnalysis = async (
  fileKeyPrefix: string,
): Promise<ExamAnalysis> => {
  const { Body: analysis } = await s3Client.send(
    new GetObjectCommand({
      Bucket: Bucket['exam-bucket'].bucketName,
      Key: `${fileKeyPrefix}/${EXAM_BLANK}/analysis.json`,
    }),
  );

  if (analysis === undefined) {
    throw new Error();
  }

  const stringanalysis = await streamToString(analysis as Readable);

  return examAnalysisSchema.parse(JSON.parse(stringanalysis));
};
