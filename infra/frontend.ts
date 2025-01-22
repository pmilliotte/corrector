import * as aws from '@pulumi/aws';

import { api } from './api';
import { userPool, userPoolClient } from './auth';

// Define the Cache Policy
const cachePolicy = new aws.cloudfront.CachePolicy('origin-cors', {
  name: `${$app.name}-${$app.stage}-origin-cors`,
  parametersInCacheKeyAndForwardedToOrigin: {
    headersConfig: {
      headerBehavior: 'whitelist',
      headers: { items: ['Origin', 'Authorization'] },
    },
    cookiesConfig: {
      cookieBehavior: 'none',
    },
    queryStringsConfig: {
      queryStringBehavior: 'all',
    },
  },
});

// Define the Distribution
const reverseProxy = new aws.cloudfront.Distribution('reverse-proxy', {
  enabled: true,
  origins: [
    {
      originId: 'us.i.posthog.com',
      domainName: 'us.i.posthog.com',
      customOriginConfig: {
        originProtocolPolicy: 'https-only',
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
      },
    },
    {
      originId: 'us-assets.i.posthog.com',
      domainName: 'us-assets.i.posthog.com',
      customOriginConfig: {
        originProtocolPolicy: 'https-only',
        httpPort: 80,
        httpsPort: 443,
        originSslProtocols: ['TLSv1', 'TLSv1.1', 'TLSv1.2'],
      },
    },
  ],
  defaultCacheBehavior: {
    targetOriginId: 'us.i.posthog.com',
    viewerProtocolPolicy: 'https-only',
    allowedMethods: [
      'GET',
      'HEAD',
      'OPTIONS',
      'PUT',
      'POST',
      'PATCH',
      'DELETE',
    ],
    cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
    cachePolicyId: cachePolicy.id,
  },
  orderedCacheBehaviors: [
    {
      pathPattern: '/static/*',
      targetOriginId: 'us-assets.i.posthog.com',
      viewerProtocolPolicy: 'https-only',
      allowedMethods: [
        'GET',
        'HEAD',
        'OPTIONS',
        'PUT',
        'POST',
        'PATCH',
        'DELETE',
      ],
      cachedMethods: ['GET', 'HEAD', 'OPTIONS'],
      cachePolicyId: cachePolicy.id,
    },
  ],
  restrictions: {
    geoRestriction: {
      restrictionType: 'none',
    },
  },
  viewerCertificate: {
    cloudfrontDefaultCertificate: true,
  },
});

export const site = new sst.aws.StaticSite('web', {
  path: 'packages/web',
  build: {
    command: 'pnpm run build',
    output: 'dist',
  },
  environment: {
    VITE_APP_API_URL: api.url,
    VITE_APP_REGION: aws.getRegionOutput().name,
    VITE_APP_USER_POOL_ID: userPool.id,
    VITE_APP_USER_POOL_CLIENT_ID: userPoolClient.id,
    VITE_REVERSE_PROXY_DOMAIN_NAME: reverseProxy.domainName,
  },
});
