import { TRPCError } from '@trpc/server';

import { Session } from '@corrector/shared';

export const validateOrganizationAccess = (
  organizationId: string,
  session: Session,
): void => {
  if (session.organizations[organizationId] === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'hello' });
  }
};
