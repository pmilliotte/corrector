import { z } from 'zod';

export const payloadOrganizationsSchema = z.record(
  z.string(),
  z.union([
    z.object({
      admin: z.boolean(),
    }),
    z.undefined(),
  ]),
);

export const payloadSchema = z.object({
  userId: z.string(),
  given_name: z.string(),
  family_name: z.string(),
  email: z.string(),
  // Overridden claims are strings
  organizations: z.string(),
});
