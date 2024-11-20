import { flattenMessages } from '~/lib/utils';

import { commonMessages } from './common';
import { errorMessages, loginMessages, notFoundMessages } from './pages';

export const frenchMessages = flattenMessages({
  ...commonMessages,
  ...loginMessages,
  ...notFoundMessages,
  ...errorMessages,
});
