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
import { PDF_FILE_NAME } from '@corrector/shared';

import { Core } from './Core';

enum Route {
  PresignedUrlGet = 'GET /presignedUrlGet',
  PresignedUrlPost = 'POST /presignedUrlPost',
  ExamCreate = 'POST /examCreate',
  ExamList = 'GET /examList',
  ExamGet = 'GET /examGet',
  ExamFilesGet = 'GET /examFilesGet',
  ExamFileGet = 'GET /examFileGet',
  ExamSubjectDelete = 'POST /examSubjectDelete',
  ExamSubjectAnalyze = 'POST /examSubjectAnalyze',
  ExamSubjectAnalysisGet = 'GET /examSubjectAnalysisGet',
  ExamSubjectAnalysisQuestionUpdate = 'POST /examSubjectAnalysisQuestionUpdate',
  ExamSubjectAnalysisQuestionMethodUpdate = 'POST /examSubjectAnalysisQuestionMethodUpdate',
  ExamSubjectAnalysisQuestionMethodAdd = 'POST /examSubjectAnalysisQuestionMethodAdd',
  ExamSubjectAnalysisQuestionMethodDelete = 'POST /examSubjectAnalysisQuestionMethodDelete',
  ExamResponseList = 'GET /examResponseList',
  ResponseCreate = 'POST /responseCreate',
  ResponseList = 'GET /responseList',
  ResponseDelete = 'POST /responseDelete',
  ExamResponseAnalyze = 'POST /examResponseAnalyze',
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

  const ON_FILE_UPLOADED_NOTIFICATION = 'onFileUploaded';

  const graphicsmagickLayer = LayerVersion.fromLayerVersionArn(
    stack,
    'graphicsmagick-layer',
    'arn:aws:lambda:eu-west-1:175033217214:layer:graphicsmagick:2',
  );
  const ghostscriptLayer = LayerVersion.fromLayerVersionArn(
    stack,
    'ghostscript-layer',
    'arn:aws:lambda:eu-west-1:764866452798:layer:ghostscript:15',
  );
  const onFileUploadedFunction = new Function(stack, 'exam-file-uploaded', {
    handler: 'packages/functions/src/exam/functions/onFileUploaded.handler',
    timeout: '3 minutes',
    architecture: 'x86_64',
    layers: [graphicsmagickLayer, ghostscriptLayer],
    environment: {
      GM_PATH: process.env.GM_PATH ?? '',
    },
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
    notifications: {
      [ON_FILE_UPLOADED_NOTIFICATION]: {
        function: onFileUploadedFunction,
        events: ['object_created'],
        filters: [{ suffix: `/${PDF_FILE_NAME}.pdf` }],
      },
    },
  });

  examBucket.bind([examBucket, examTable]);

  const openAiApiKey = new Config.Secret(stack, 'OPENAI_API_KEY');
  const openAiProjectId = new Config.Secret(stack, 'OPENAI_PROJECT_ID');

  const i18nLayer = new LayerVersion(stack, 'i18n', {
    description: 'Locales for i18n',
    code: Code.fromAsset('packages/functions/src/exam/layers/i18n'),
    compatibleRuntimes: [Runtime.NODEJS_18_X],
  });
  const apiEndpoint = new Function(stack, 'exam-function', {
    handler: 'packages/functions/src/exam/functions/index.handler',
    environment: {
      LOCALES_PATH: process.env.LOCALES_PATH ?? '',
      STAGE: stack.stage,
    },
  });
  apiEndpoint.addLayers(i18nLayer);
  const timeoutApiEndpoint = new Function(stack, 'exam-function-timeout', {
    handler: 'packages/functions/src/exam/functions/index.handler',
    environment: {
      LOCALES_PATH: process.env.LOCALES_PATH ?? '',
      STAGE: stack.stage,
    },
    timeout: 29,
  });
  timeoutApiEndpoint.addLayers(i18nLayer);

  api.addRoutes(stack, {
    [Route.PresignedUrlGet]: apiEndpoint,
    [Route.PresignedUrlPost]: apiEndpoint,
    [Route.ExamCreate]: apiEndpoint,
    [Route.ExamList]: apiEndpoint,
    [Route.ExamGet]: apiEndpoint,
    [Route.ExamFilesGet]: apiEndpoint,
    [Route.ExamFileGet]: apiEndpoint,
    [Route.ExamSubjectDelete]: apiEndpoint,
    [Route.ExamSubjectAnalyze]: timeoutApiEndpoint,
    [Route.ExamResponseAnalyze]: timeoutApiEndpoint,
    [Route.ExamSubjectAnalysisGet]: apiEndpoint,
    [Route.ExamSubjectAnalysisQuestionUpdate]: apiEndpoint,
    [Route.ExamSubjectAnalysisQuestionMethodAdd]: apiEndpoint,
    [Route.ExamSubjectAnalysisQuestionMethodUpdate]: apiEndpoint,
    [Route.ExamSubjectAnalysisQuestionMethodDelete]: apiEndpoint,
    [Route.ExamResponseList]: apiEndpoint,
    [Route.ResponseCreate]: apiEndpoint,
    [Route.ResponseList]: apiEndpoint,
    [Route.ResponseDelete]: apiEndpoint,
  });

  api.bindToRoute(Route.PresignedUrlGet, [examBucket, examTable]);
  api.bindToRoute(Route.PresignedUrlPost, [examBucket, examTable]);
  api.bindToRoute(Route.ExamCreate, [examTable]);
  api.bindToRoute(Route.ExamList, [examTable]);
  api.bindToRoute(Route.ExamGet, [examTable]);
  api.bindToRoute(Route.ExamFilesGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamFileGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamSubjectDelete, [examTable, examBucket]);
  api.bindToRoute(Route.ExamSubjectAnalyze, [
    examTable,
    examBucket,
    openAiApiKey,
    openAiProjectId,
  ]);
  api.bindToRoute(Route.ExamResponseAnalyze, [
    examTable,
    examBucket,
    openAiApiKey,
    openAiProjectId,
  ]);
  api.bindToRoute(Route.ExamSubjectAnalysisGet, [examTable, examBucket]);
  api.bindToRoute(Route.ExamSubjectAnalysisQuestionUpdate, [
    examTable,
    examBucket,
  ]);
  api.bindToRoute(Route.ExamSubjectAnalysisQuestionMethodAdd, [
    examTable,
    examBucket,
  ]);
  api.bindToRoute(Route.ExamSubjectAnalysisQuestionMethodDelete, [
    examTable,
    examBucket,
  ]);
  api.bindToRoute(Route.ExamSubjectAnalysisQuestionMethodUpdate, [
    examTable,
    examBucket,
  ]);
  api.bindToRoute(Route.ExamResponseList, [examTable, examBucket]);
  api.bindToRoute(Route.ResponseCreate, [examTable]);
  api.bindToRoute(Route.ResponseList, [examTable]);
  api.bindToRoute(Route.ResponseDelete, [examTable]);
};
