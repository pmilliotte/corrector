import { z } from 'zod';

import { payloadOrganizationsSchema, payloadSchema } from '../constants';

export type Payload = z.infer<typeof payloadSchema>;

export type Session = {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
  organizations: SessionOrganizations;
};

export type SessionOrganizations = z.infer<typeof payloadOrganizationsSchema>;
