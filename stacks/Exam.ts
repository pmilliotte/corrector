import { StorageClass } from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib/core';
import { Bucket, Config, StackContext, Table, use } from 'sst/constructs';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { Core } from './Core';

enum Route {
  PresignedUrlGet = 'GET /presignedUrlGet',
  PresignedUrlPost = 'POST /presignedUrlPost',
  ExamCreate = 'POST /examCreate',
  ExamList = 'GET /examList',
  ExamGet = 'GET /examGet',
  ExamFilesGet = 'GET /examFilesGet',
  ExamFileDelete = 'POST /examFileDelete',
  ExamCorrect = 'POST /examCorrect',
}

export const Exam = ({ stack, app }: StackContext): void => {
  const { api } = use(Core);

  const examTable = new Table(stack, 'exam-table', {
    fields: {
      [PARTITION_KEY]: 'string',
      [SORT_KEY]: 'string',
    },
    primaryIndex: { partitionKey: PARTITION_KEY, sortKey: SORT_KEY },
  });

  const examBucket = new Bucket(stack, 'exam-bucket', {
    name: `${stack.stage}-${app.name}-exam`,
    blockPublicACLs: true,
    cdk: {
      bucket: {
        lifecycleRules: [
          {
            transitions: [
              {
                storageClass: StorageClass.INTELLIGENT_TIERING,
                transitionAfter: Duration.days(0),
              },
            ],
          },
        ],
      },
    },
  });

  const openAiApiKey = new Config.Secret(stack, 'OPENAI_API_KEY');
  const openAiProjectId = new Config.Secret(stack, 'OPENAI_PROJECT_ID');

  api.addRoutes(stack, {
    [Route.PresignedUrlGet]:
      'packages/functions/src/exam/functions/index.handler',
    [Route.PresignedUrlPost]:
      'packages/functions/src/exam/functions/index.handler',
    [Route.ExamCreate]: 'packages/functions/src/exam/functions/index.handler',
    [Route.ExamList]: 'packages/functions/src/exam/functions/index.handler',
    [Route.ExamGet]: 'packages/functions/src/exam/functions/index.handler',
    [Route.ExamFilesGet]: 'packages/functions/src/exam/functions/index.handler',
    [Route.ExamFileDelete]:
      'packages/functions/src/exam/functions/index.handler',
    [Route.ExamCorrect]: 'packages/functions/src/exam/functions/index.handler',
  });

  api.bindToRoute(Route.PresignedUrlGet, [examBucket, examTable]);
  api.bindToRoute(Route.PresignedUrlPost, [examBucket, examTable]);
  api.bindToRoute(Route.ExamCreate, [examTable]);
  api.bindToRoute(Route.ExamList, [examTable]);
  api.bindToRoute(Route.ExamGet, [examTable]);
  api.bindToRoute(Route.ExamFilesGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamFileDelete, [examTable, examBucket]);
  api.bindToRoute(Route.ExamCorrect, [
    examTable,
    examBucket,
    openAiApiKey,
    openAiProjectId,
  ]);
};
