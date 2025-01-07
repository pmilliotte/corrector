import { TRPCError } from '@trpc/server';

import { Session } from '@corrector/shared';

export const validateOrganizationAccess = (
  organizationId: string,
  session: Session,
): { admin: boolean } => {
  if (organizationId === session.id) {
    return { admin: true };
  }

  const role = session.organizations[organizationId];

  if (role === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'hello' });
  }

  return role;
};
