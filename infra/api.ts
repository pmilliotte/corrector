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

api.route(Route.AnyGet, 'packages/functions/src/functions/trpc.handler', {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
api.route(Route.AnyPost, 'packages/functions/src/functions/trpc.handler', {
  auth: {
    jwt: {
      authorizer: jwtAuthorizer.id,
    },
  },
});
