import {
  AllowedMethods,
  CachedMethods,
  CacheHeaderBehavior,
  CachePolicy,
  CacheQueryStringBehavior,
  Distribution,
  OriginRequestPolicy,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { StackContext, StaticSite, use } from 'sst/constructs';

import { Core } from './Core';
import { getDomain } from './utils/constants';

export const Web = ({ stack, app }: StackContext): { site: StaticSite } => {
  const { api, auth } = use(Core);

  const cachePolicy = new CachePolicy(stack, 'origin-cors', {
    cachePolicyName: `${stack.stage}-${app.name}-origin-cors`,
    headerBehavior: CacheHeaderBehavior.allowList('Origin', 'Authorization'),
    queryStringBehavior: CacheQueryStringBehavior.all(),
  });

  const reverseProxy = new Distribution(stack, 'reverse-proxy', {
    defaultBehavior: {
      origin: new HttpOrigin('us.i.posthog.com'),
      viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
      allowedMethods: AllowedMethods.ALLOW_ALL,
      cachedMethods: CachedMethods.CACHE_GET_HEAD_OPTIONS,
      cachePolicy,
      originRequestPolicy: OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
      responseHeadersPolicy:
        ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
    },
    additionalBehaviors: {
      '/static/*': {
        origin: new HttpOrigin('us-assets.i.posthog.com'),
        cachePolicy,
        originRequestPolicy: OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
        responseHeadersPolicy:
          ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT_AND_SECURITY_HEADERS,
      },
    },
  });

  const site = new StaticSite(stack, 'web', {
    path: 'packages/web',
    buildOutput: 'dist',
    buildCommand:
      stack.stage === 'prod'
        ? 'pnpm run build'
        : `pnpm run build --mode ${stack.stage}`,
    customDomain:
      app.stage === 'local'
        ? undefined
        : {
            domainName: getDomain(app.stage),
            domainAlias: `www.${getDomain(app.stage)}`,
          },
    environment: {
      VITE_APP_API_URL: api.customDomainUrl ?? api.url,
      VITE_APP_REGION: app.region,
      VITE_APP_USER_POOL_ID: auth.userPoolId,
      VITE_APP_USER_POOL_CLIENT_ID: auth.userPoolClientId,
      VITE_REVERSE_PROXY_DOMAIN_NAME: reverseProxy.distributionDomainName,
    },
    cdk: {
      bucket: {
        bucketName: `${stack.stage}-${app.name}-web`,
      },
      distribution: {
        defaultBehavior: {
          responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        },
      },
    },
  });

  stack.addOutputs({ SiteUrl: site.customDomainUrl ?? site.url });

  return { site };
};
