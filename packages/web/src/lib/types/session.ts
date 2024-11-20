import { z } from 'zod';

import { payloadOrganizationsSchema, payloadSchema } from '@corrector/shared';

export type Payload = z.infer<typeof payloadSchema>;

export type Session = {
  email: string;
  id: string;
  firstName: string;
  lastName: string;
  organizations: Organizations;
};

export type Organizations = z.infer<typeof payloadOrganizationsSchema>;
