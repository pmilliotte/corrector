import {
  AdminCreateUserCommand,
  DeliveryMediumType,
} from '@aws-sdk/client-cognito-identity-provider';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { cognitoClient } from '~/clients';
import { authedProcedure } from '~/trpc';

import { UserEntity } from '../libs';

export const userCreate = authedProcedure
  .input(
    z.object({
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
    }),
  )
  .mutation(
    async ({
      input: { firstName, lastName, email },
      ctx: { session: _session },
    }) => {
      const { User } = await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: process.env.USER_POOL_ID,
          Username: email,
          DesiredDeliveryMediums: [DeliveryMediumType.EMAIL],
          UserAttributes: [
            {
              Name: 'given_name',
              Value: firstName,
            },
            {
              Name: 'family_name',
              Value: lastName,
            },
            {
              Name: 'email',
              Value: email,
            },
          ],
        }),
      );

      if (User?.Username === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      await UserEntity.put({
        id: User.Username,
      });

      return { id: User.Username };
    },
  );
