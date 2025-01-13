// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app: input => ({
    name: 'corrector',
    removal: input.stage === 'production' ? 'retain' : 'remove',
    protect: ['production'].includes(input.stage),
    home: 'aws',
    providers: {
      aws: {
        region: 'eu-west-1',
      },
    },
  }),
  run: async () => {
    await import('./infra/storage');
    const auth = await import('./infra/auth');
    await import('./infra/api');
    await import('./infra/frontend');

    return {
      UserPool: auth.userPool.id,
      Region: aws.getRegionOutput().name,
      UserPoolClient: auth.userPoolClient.id,
    };
  },
});
