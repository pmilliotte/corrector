import { z } from 'zod';

export const payloadOrganizationsSchema = z.record(
  z.string(),
  z.object({
    admin: z.boolean(),
  }),
);

export const payloadSchema = z.object({
  sub: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string(),
  // Overridden claims are strings
  organizations: z.string(),
});
