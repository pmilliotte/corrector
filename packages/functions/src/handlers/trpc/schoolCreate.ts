import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { PutItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  computeSchoolEntityPartitionKey,
  OrganizationTable,
  SchoolEntity,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const schoolCreate = authedProcedure
  .input(
    z.object({
      name: z.string().min(1),
      uai: z.string().optional(),
      organizationId: z.string(),
      city: z.string(),
      pseudo: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { uai, name, organizationId, city, pseudo },
    }) => {
      validateOrganizationAccess(organizationId, session);

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

      if (schools.some(school => school.uai === uai)) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const id = randomUUID();

      await SchoolEntity.build(PutItemCommand)
        .item({
          id,
          organizationId,
          name,
          uai,
          city,
          pseudo: pseudo === '' ? name : pseudo,
        })
        .options({
          condition: {
            attr: 'id',
            exists: false,
          },
        })
        .send();

      return { id };
    },
  );
