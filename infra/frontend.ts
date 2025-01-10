import { api } from './api';
import { userPool, userPoolClient } from './auth';

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
  },
});
