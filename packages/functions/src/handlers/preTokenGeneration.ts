import {
  PreTokenGenerationTriggerEvent,
  PreTokenGenerationTriggerHandler,
} from 'aws-lambda';
import { randomUUID } from 'crypto';
import { PutItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';

import { LSI1 } from '@corrector/backend-shared';

import {
  computeUserEntityLSI1SortKey,
  OrganizationTable,
  UserEntity,
} from '~/libs';

export const handler: PreTokenGenerationTriggerHandler = async (
  event,
): Promise<PreTokenGenerationTriggerEvent> => {
  const query: Query<typeof OrganizationTable> = {
    partition: UserEntity.name,
    index: LSI1,
    range: {
      eq: computeUserEntityLSI1SortKey({
        email: event.request.userAttributes.email,
      }),
    },
  };

  const { Items: users } = await OrganizationTable.build(QueryCommand)
    .query(query)
    .entities(UserEntity)
    .send();

  if (users === undefined || users.length > 1) {
    throw new Error();
  }

  const userId = randomUUID();

  if (users.length === 0) {
    await UserEntity.build(PutItemCommand)
      .item({
        id: userId,
        sub: event.userName,
        email: event.request.userAttributes.email,
      })
      .options({
        condition: {
          attr: 'id',
          exists: false,
        },
      })
      .send();

    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: {
        userId,
        organizations: JSON.stringify({
          [userId]: { admin: true },
        }),
      },
    };

    return event;
  }

  const user = users[0];

  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      userId: user.id,
      organizations: JSON.stringify({
        [user.id]: { admin: true },
      }),
    },
  };

  return event;
};
