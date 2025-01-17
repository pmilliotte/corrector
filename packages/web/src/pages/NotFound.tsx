import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { QuestionMarkCircle } from '~/components/icons';

export const NotFound = (): ReactElement => (
  <div className="h-full flex items-center justify-around">
    <div className="flex items-center space-x-2">
      <QuestionMarkCircle />
      <p className="text-sm">
        <FormattedMessage id="notFound.notFound" />
      </p>
    </div>
  </div>
);
