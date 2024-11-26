import { Session } from '~/types';

import { payloadOrganizationsSchema, payloadSchema } from '../constants';

export const getSession = (payload: { [key: string]: unknown }): Session => {
  const parsedPayload = payloadSchema.parse(payload);
  const parsedOgranizations = payloadOrganizationsSchema.parse(
    JSON.parse(parsedPayload.organizations),
  );

  return {
    email: parsedPayload.email,
    id: parsedPayload.userId,
    firstName: parsedPayload.given_name,
    lastName: parsedPayload.family_name,
    organizations: parsedOgranizations,
  };
};
