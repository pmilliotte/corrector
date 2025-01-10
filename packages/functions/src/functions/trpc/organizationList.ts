import { TRPCError } from '@trpc/server';
import {
  BatchGetCommand,
  BatchGetRequest,
  executeBatchGet,
  Query,
  QueryCommand,
} from 'dynamodb-toolbox';
import compact from 'lodash/compact';

import {
  computeUserOrganizationEntitySortKey,
  OrganizationEntity,
  OrganizationTable,
  UserOrganizationEntity,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const organizationList = authedProcedure.query(
  async ({
    ctx: {
      session: { id: userId },
    },
  }) => {
    const query: Query<typeof OrganizationTable> = {
      partition: OrganizationEntity.name,
      range: {
        eq: computeUserOrganizationEntitySortKey({
          userId,
        }),
      },
    };

    const { Items: userOrganizations } = await OrganizationTable.build(
      QueryCommand,
    )
      .query(query)
      .entities(UserOrganizationEntity)
      .send();

    if (userOrganizations === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    if (userOrganizations.length === 0) {
      return [];
    }

    const organizationsCommand = OrganizationTable.build(
      BatchGetCommand,
    ).requests(
      ...userOrganizations.map(({ organizationId }) =>
        OrganizationEntity.build(BatchGetRequest).key({
          id: organizationId,
        }),
      ),
    );

    const {
      Responses: [organizations],
    } = await executeBatchGet(organizationsCommand);

    return compact(organizations).map(({ id, name }) => ({
      id,
      name,
      admin:
        userOrganizations.find(({ organizationId }) => organizationId === id)
          ?.admin ?? false,
    }));
  },
);
