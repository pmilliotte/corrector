import { examTable, organizationTable } from './storage';

const preTokenGenerationTrigger = new sst.aws.Function('pre-token-generation', {
  handler: 'packages/functions/src/functions/preTokenGeneration.handler',
  link: [organizationTable, examTable],
});

export const userPool = new sst.aws.CognitoUserPool('users', {
  usernames: ['email'],
  triggers: { preTokenGeneration: preTokenGenerationTrigger.arn },
});

export const userPoolClient = userPool.addClient('users-client');
