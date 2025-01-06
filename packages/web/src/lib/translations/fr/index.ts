import { flattenMessages } from '~/lib/utils';

import { commonMessages } from './common';
import {
  classroomsMessages,
  errorMessages,
  examsMessages,
  loginMessages,
  notFoundMessages,
} from './pages';

export const frenchMessages = flattenMessages({
  ...commonMessages,
  ...loginMessages,
  ...notFoundMessages,
  ...errorMessages,
  ...examsMessages,
  ...classroomsMessages,
});
