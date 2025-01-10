import { GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

import { streamToString } from '@corrector/backend-shared';
import {
  CorrectionOutput,
  correctionOutputSchema,
  ExamAnalysis,
  examAnalysisSchema,
} from '@corrector/shared';

import { s3Client } from '~/clients';

export const getExamAnalysis = async (
  fileKeyPrefix: string,
): Promise<ExamAnalysis> => {
  const { Body: analysis } = await s3Client.send(
    new GetObjectCommand({
      Bucket: Resource['exam-bucket'].name,
      Key: `${fileKeyPrefix}/analysis.json`,
    }),
  );

  if (analysis === undefined) {
    throw new Error();
  }

  const stringanalysis = await streamToString(analysis as Readable);

  return examAnalysisSchema.parse(JSON.parse(stringanalysis));
};

export const getResponseAnalysis = async (
  fileKeyPrefix: string,
): Promise<CorrectionOutput> => {
  const { Body: analysis } = await s3Client.send(
    new GetObjectCommand({
      Bucket: Resource['exam-bucket'].name,
      Key: `${fileKeyPrefix}/analysis.json`,
    }),
  );

  if (analysis === undefined) {
    throw new Error();
  }

  const stringanalysis = await streamToString(analysis as Readable);

  return correctionOutputSchema.parse(JSON.parse(stringanalysis));
};
