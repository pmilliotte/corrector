import { TRPCError } from '@trpc/server';

import { Session } from '@corrector/shared';

export const validateOrganizationAccess = (
  organizationId: string,
  session: Session,
): { admin: boolean } => {
  console.log('organizationId', organizationId);
  if (organizationId === session.id) {
    return { admin: true };
  }

  if (session.organizations[organizationId] === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'hello' });
  }

  return session.organizations[organizationId];
};
