import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  computeSchoolEntityPartitionKey,
  OrganizationTable,
  SchoolEntity,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const schoolList = authedProcedure
  .input(
    z.object({
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { organizationId } }) => {
    const { admin } = validateOrganizationAccess(organizationId, session);
    if (!admin) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const query: Query<typeof OrganizationTable> = {
      partition: computeSchoolEntityPartitionKey({ organizationId }),
    };

    const { Items: schools } = await OrganizationTable.build(QueryCommand)
      .query(query)
      .entities(SchoolEntity)
      .send();

    if (schools === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    return schools.map(
      ({ [$entity]: _entityName, ...restOfSchool }) => restOfSchool,
    );
  });
