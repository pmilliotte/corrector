import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';

import { Session } from '@corrector/shared';

import { validateOrganizationAccess } from '~/libs';

import { UserClassroomEntity } from '../entities';

export const validateClassroomWriteAccess = async (
  {
    organizationId,
    classroomId,
  }: {
    organizationId: string;
    classroomId: string;
  },
  session: Session,
): Promise<void> => {
  const { admin } = validateOrganizationAccess(organizationId, session);
  if (admin) {
    return;
  }

  const { Item: userClassroom } = await UserClassroomEntity.build(
    GetItemCommand,
  )
    .key({
      classroomId,
      organizationId,
      userId: session.id,
      userType: 'teacher',
    })
    .send();

  if (userClassroom === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
};
