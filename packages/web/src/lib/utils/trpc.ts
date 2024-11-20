import { createTRPCReact } from '@trpc/react-query';

import type { AppRouter } from '@corrector/functions';

export const trpc = createTRPCReact<AppRouter>();
