import { GetObjectCommand } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { $set, UpdateItemCommand } from 'dynamodb-toolbox';
import { Resource } from 'sst';

import { s3Client } from '~/clients';
import {
  ExamEntity,
  FormattedStatement,
  getProblem,
  hasOneProblemOnly,
  parseExamUploadedFileKey,
} from '~/libs';

export const handler = async (event: S3Event): Promise<void> => {
  await Promise.all(
    event.Records.map(async record => {
      const objectKey = record.s3.object.key;

      const match = parseExamUploadedFileKey(objectKey);

      if (match === undefined) {
        return;
      }

      const { examId, fileName, userId } = match;

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            uploadFiles: {
              [fileName]: $set({
                status: 'uploaded',
                problem: undefined,
              }),
            },
          },
        })
        .send();

      const { Body: rawData } = await s3Client.send(
        new GetObjectCommand({
          Key: objectKey,
          Bucket: Resource['exam-bucket'].name,
        }),
      );

      if (rawData === undefined) {
        throw new Error();
      }

      const base64 = await rawData.transformToString('base64');

      try {
        const isOneProblem = await hasOneProblemOnly(base64);
        if (!isOneProblem) {
          throw new Error();
        }
        const problem = await getProblem(base64);

        await ExamEntity.build(UpdateItemCommand)
          .item({
            id: examId,
            userId,
            problems: {
              uploadFiles: {
                [fileName]: $set({
                  status: 'analyzed',
                  problem: formatProblem(problem),
                }),
              },
            },
          })
          .send();
      } catch (e) {
        console.log(e);

        await ExamEntity.build(UpdateItemCommand)
          .item({
            id: examId,
            userId,
            problems: {
              uploadFiles: {
                [fileName]: $set({
                  status: 'error',
                  problem: undefined,
                }),
              },
            },
          })
          .send();
      }
    }),
  );
};

type Statement = {
  type: 'statement' | 'question';
  text: string;
  numberOfLines: number;
};

type Problem = {
  content: {
    text: string;
    type: 'statement' | 'question';
    numberOfLines: number;
  }[];
};

type FormattedProblem = { content: FormattedStatement[]; id: string };

const formatStatement = (
  statement: Statement,
  index: number,
): FormattedStatement => {
  if (statement.type === 'statement') {
    return {
      text: statement.text,
      type: 'statement',
      id: randomUUID(),
    };
  }

  return {
    ...statement,
    type: 'question',
    id: randomUUID(),
    index,
  };
};
const formatProblem = (problem: Problem): FormattedProblem => {
  let questionIndex = 0;

  const formattedProblemContent = problem.content.reduce((acc, statement) => {
    if (statement.type === 'statement') {
      return [...acc, formatStatement(statement, questionIndex)];
    }

    questionIndex++;

    return [...acc, formatStatement(statement, questionIndex)];
  }, [] as FormattedStatement[]);

  return {
    content: formattedProblemContent,
    id: randomUUID(),
  };
};
