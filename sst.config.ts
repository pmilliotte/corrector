import type { SSTConfig } from 'sst';

import { Core, Web } from './stacks';

export default {
  config: _input => ({
    name: 'corrector',
    region: 'eu-west-1',
  }),
  stacks: app => {
    app.setDefaultFunctionProps({
      runtime: 'nodejs18.x',
      logRetention: 'one_day',
      architecture: 'arm_64',
    });

    app.stack(Core);
    app.stack(Web);
  },
} satisfies SSTConfig;
