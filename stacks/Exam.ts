import { Code, LayerVersion, Runtime } from 'aws-cdk-lib/aws-lambda';
import { StorageClass } from 'aws-cdk-lib/aws-s3';
import { Duration } from 'aws-cdk-lib/core';
import {
  Bucket,
  Config,
  Function,
  StackContext,
  Table,
  use,
} from 'sst/constructs';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { EXAM_BLANK_PATH_SUFFIX } from '@corrector/shared';

import { Core } from './Core';

enum Route {
  PresignedUrlGet = 'GET /presignedUrlGet',
  PresignedUrlPost = 'POST /presignedUrlPost',
  ExamCreate = 'POST /examCreate',
  ExamList = 'GET /examList',
  ExamGet = 'GET /examGet',
  ExamFilesGet = 'GET /examFilesGet',
  ExamFileGet = 'GET /examFileGet',
  ExamFileDelete = 'POST /examFileDelete',
  ExamSubjectAnalyze = 'POST /examSubjectAnalyze',
  ExamSubjectAnalysisGet = 'GET /examSubjectAnalysisGet',
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

  const ON_OBJECT_CREATED_NOTIFICATION = 'onObjectCreated';
  const ON_OBJECT_DELETED_NOTIFICATION = 'onObjectDeleted';

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
    notifications: {
      [ON_OBJECT_CREATED_NOTIFICATION]: {
        function: {
          handler:
            'packages/functions/src/exam/functions/onObjectCreated.handler',
        },
        events: ['object_created'],
        filters: [{ suffix: EXAM_BLANK_PATH_SUFFIX }],
      },
      [ON_OBJECT_DELETED_NOTIFICATION]: {
        function: {
          handler:
            'packages/functions/src/exam/functions/onObjectDeleted.handler',
        },
        events: ['object_removed'],
        filters: [{ suffix: EXAM_BLANK_PATH_SUFFIX }],
      },
    },
  });

  examBucket.bind([examBucket, examTable]);

  const openAiApiKey = new Config.Secret(stack, 'OPENAI_API_KEY');
  const openAiProjectId = new Config.Secret(stack, 'OPENAI_PROJECT_ID');

  const apiEndpoint = new Function(stack, 'exam-function', {
    handler: 'packages/functions/src/exam/functions/index.handler',
  });
  const examMarksGetEndpoint = new Function(stack, 'exam-marks-get-function', {
    handler: 'packages/functions/src/exam/functions/index.handler',
    timeout: '3 minutes',
    environment: {
      LOCALES_PATH:
        stack.stage === 'local'
          ? 'packages/functions/src/exam/layers/i18n'
          : '/opt',
    },
    architecture: 'x86_64',
  });

  const i18nLayer = new LayerVersion(stack, 'i18n', {
    description: 'Locales for i18n',
    code: Code.fromAsset('packages/functions/src/exam/layers/i18n'),
    compatibleRuntimes: [Runtime.NODEJS_18_X],
  });
  const graphicsmagickLayer = LayerVersion.fromLayerVersionArn(
    stack,
    'imagemagick-layer',
    'arn:aws:lambda:eu-west-1:175033217214:layer:graphicsmagick:2',
  );
  const ghostscriptLayer = LayerVersion.fromLayerVersionArn(
    stack,
    'ghostscript-layer',
    'arn:aws:lambda:eu-west-1:764866452798:layer:ghostscript:15',
  );

  examMarksGetEndpoint.addLayers(
    i18nLayer,
    graphicsmagickLayer,
    ghostscriptLayer,
  );

  api.addRoutes(stack, {
    [Route.PresignedUrlGet]: apiEndpoint,
    [Route.PresignedUrlPost]: apiEndpoint,
    [Route.ExamCreate]: apiEndpoint,
    [Route.ExamList]: apiEndpoint,
    [Route.ExamGet]: apiEndpoint,
    [Route.ExamFilesGet]: apiEndpoint,
    [Route.ExamFileGet]: apiEndpoint,
    [Route.ExamFileDelete]: apiEndpoint,
    [Route.ExamSubjectAnalyze]: examMarksGetEndpoint,
    [Route.ExamSubjectAnalysisGet]: apiEndpoint,
  });

  api.bindToRoute(Route.PresignedUrlGet, [examBucket, examTable]);
  api.bindToRoute(Route.PresignedUrlPost, [examBucket, examTable]);
  api.bindToRoute(Route.ExamCreate, [examTable]);
  api.bindToRoute(Route.ExamList, [examTable]);
  api.bindToRoute(Route.ExamGet, [examTable]);
  api.bindToRoute(Route.ExamFilesGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamFileGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamFileDelete, [examTable, examBucket]);
  api.bindToRoute(Route.ExamSubjectAnalyze, [
    examTable,
    examBucket,
    openAiApiKey,
    openAiProjectId,
  ]);
  api.bindToRoute(Route.ExamSubjectAnalysisGet, [examTable, examBucket]);
};
