import { userPool, userPoolClient } from './auth';
import { examTable, organizationTable } from './storage';

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
});
const jwtAuthorizer = api.addAuthorizer({
  name: 'cognitoAuthorizer',
  jwt: {
    issuer: $interpolate`https://cognito-idp.${aws.getRegionOutput().name}.amazonaws.com/${userPool.id}`,
    audiences: [userPoolClient.id],
  },
});

api.route(
  Route.AnyGet,
  {
    handler: 'packages/functions/src/functions/trpc.handler',
    link: [organizationTable, examTable],
  },
  {
    auth: {
      jwt: {
        authorizer: jwtAuthorizer.id,
      },
    },
  },
);
api.route(
  Route.AnyPost,
  {
    handler: 'packages/functions/src/functions/trpc.handler',
    link: [organizationTable],
  },
  {
    auth: {
      jwt: {
        authorizer: jwtAuthorizer.id,
      },
    },
  },
);