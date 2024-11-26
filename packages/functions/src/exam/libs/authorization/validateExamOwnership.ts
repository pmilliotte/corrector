import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';

import { Session } from '@corrector/shared';

import { ExamEntity } from '../entities';

export const validateExamOwnership = async (
  {
    organizationId,
    examId,
  }: {
    organizationId: string;
    examId: string;
  },
  session: Session,
): Promise<void> => {
  const { Item: exam } = await ExamEntity.build(GetItemCommand)
    .key({ id: examId, organizationId })
    .send();

  if (exam === undefined || exam.userId !== session.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
};
