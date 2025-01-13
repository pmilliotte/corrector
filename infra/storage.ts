import {
  LSI1,
  LSI1_SK,
  PARTITION_KEY,
  SORT_KEY,
} from '@corrector/backend-shared';

export const organizationTable = new sst.aws.Dynamo('organization-table', {
  fields: {
    [PARTITION_KEY]: 'string',
    [SORT_KEY]: 'string',
    [LSI1_SK]: 'string',
  },
  primaryIndex: { hashKey: PARTITION_KEY, rangeKey: SORT_KEY },
  localIndexes: {
    [LSI1]: { rangeKey: LSI1_SK },
  },
});

export const examTable = new sst.aws.Dynamo('exam-table', {
  fields: {
    [PARTITION_KEY]: 'string',
    [SORT_KEY]: 'string',
  },
  primaryIndex: { hashKey: PARTITION_KEY, rangeKey: SORT_KEY },
});

export const openAiApiKey = new sst.Secret('OpenaiApiKey');
export const openAiProjectId = new sst.Secret('OpenaiProjectId');

export const examBucket = new sst.aws.Bucket('exam-bucket', {
  transform: {
    bucket: {
      lifecycleRules: [
        {
          enabled: true,
          transitions: [
            {
              storageClass: 'INTELLIGENT_TIERING',
              days: 0,
            },
          ],
        },
      ],
    },
  },
});
const ON_EXAM_FILE_UPLOADED_NOTIFICATION = 'onExamFileUploaded';
const onexamFileUploadedFunction = new sst.aws.Function(
  'exam-file-problem-uploaded',
  {
    handler: 'packages/functions/src/functions/onExamFileUploaded.handler',
    timeout: '3 minutes',
    architecture: 'x86_64',
    link: [openAiApiKey, openAiProjectId, examBucket, examTable],
  },
);
examBucket.notify({
  notifications: [
    {
      name: ON_EXAM_FILE_UPLOADED_NOTIFICATION,
      function: onexamFileUploadedFunction.arn,
      events: ['s3:ObjectCreated:*'],
    },
  ],
});
