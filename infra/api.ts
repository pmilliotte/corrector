import { userPool, userPoolClient } from './auth';
import { examBucket, examTable, organizationTable } from './storage';

enum Route {
  AnyGet = 'GET /{proxy+}',
  AnyPost = 'POST /{proxy+}',
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

const trpcGet = new sst.aws.Function('trpc-get', {
  handler: 'packages/functions/src/functions/trpc.handler',
  link: [examBucket, examTable, organizationTable],
});
api.route(Route.AnyGet, trpcGet.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});

const trpcPost = new sst.aws.Function('trpc-post', {
  handler: 'packages/functions/src/functions/trpc.handler',
  link: [examBucket, examTable, organizationTable],
});
api.route(Route.AnyPost, trpcPost.arn, {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
