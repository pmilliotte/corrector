import {
  PreTokenGenerationTriggerEvent,
  PreTokenGenerationTriggerHandler,
} from 'aws-lambda';

import { User, UserEntity } from '../libs';

export const handler: PreTokenGenerationTriggerHandler = async (
  event,
): Promise<PreTokenGenerationTriggerEvent> => {
  const { Item: user } = await UserEntity.get<User>({
    id: event.request.userAttributes.sub,
  });

  if (user === undefined) {
    await UserEntity.put({
      id: event.userName,
    });

    event.response.claimsOverrideDetails = {
      claimsToAddOrOverride: {
        organizations: JSON.stringify({
          [event.userName]: { admin: true },
          testId: { admin: false },
        }),
      },
    };

    return event;
  }

  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: {
      organizations: JSON.stringify({
        [event.userName]: { admin: true },
        testId: { admin: false },
      }),
    },
  };

  return event;
};
