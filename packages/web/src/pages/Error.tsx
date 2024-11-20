import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Layout } from '~/components';
import { ExclamationCircle } from '~/components/icons';

export const Error = (): ReactElement => (
  <Layout>
    <div className="h-full flex items-center justify-around">
      <div className="flex items-center space-x-2">
        <ExclamationCircle />
        <p className="text-sm">
          <FormattedMessage id="error.error" />
        </p>
      </div>
    </div>
  </Layout>
);
