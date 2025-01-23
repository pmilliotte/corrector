import { userPool, userPoolClient } from './auth';
import {
  examBucket,
  examTable,
  openAiApiKey,
  openAiProjectId,
  organizationTable,
} from './storage';

enum Route {
  MainGet = 'GET /{proxy+}',
  MainPost = 'POST /{proxy+}',
  ExamGeneratePdf = 'POST /examGeneratePdf',
}

export const api = new sst.aws.ApiGatewayV2('api', {
  accessLog: {
    retention: '1 week',
  },
  cors: {
    allowHeaders: ['content-type', 'authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
  },
  link: [organizationTable, examTable, examBucket],
});
const jwtAuthorizer = api.addAuthorizer({
  name: 'cognitoAuthorizer',
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
});

const resources = [
  organizationTable,
  examBucket,
  examTable,
  openAiApiKey,
  openAiProjectId,
];

const main = new sst.aws.Function('main-get', {
  handler: 'packages/functions/src/handlers/main.handler',
  link: resources,
  architecture: 'arm64',
});
api.route(Route.MainGet, main.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
api.route(Route.MainPost, main.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});

const generatePdf = new sst.aws.Function('exam-generate-pdf', {
  handler: 'packages/functions/src/handlers/examGeneratePdf.handler',
  link: resources,
  architecture: 'x86_64',
  nodejs: { install: ['@sparticuz/chromium'] },
});
api.route(Route.ExamGeneratePdf, generatePdf.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
