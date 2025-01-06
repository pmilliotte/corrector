import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';

import { Classroom, ClassroomEntity, UserClassroomEntity } from '../entities';

export const validateClassroomAccess = async ({
  organizationId,
  userId,
  classroomId,
}: {
  organizationId: string;
  userId: string;
  classroomId: string;
}): Promise<Classroom> => {
  const { Item: classUser } = await UserClassroomEntity.build(GetItemCommand)
    .key({ userId, classroomId, organizationId })
    .send();

  if (classUser === undefined) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { Item: classroom } = await ClassroomEntity.build(GetItemCommand)
    .key({ id: classroomId, organizationId })
    .send();

  if (classroom === undefined) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
  }

  return classroom;
};
