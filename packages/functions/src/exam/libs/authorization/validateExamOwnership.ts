import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';

import { Session } from '@corrector/shared';

import { Exam, ExamEntity } from '../entities';

export const validateExamOwnership = async (
  {
    organizationId,
    examId,
  }: {
    organizationId: string;
    examId: string;
  },
  session: Session,
): Promise<Exam> => {
  const { Item: exam } = await ExamEntity.build(GetItemCommand)
    .key({ id: examId, organizationId })
    .send();

  if (exam === undefined || exam.userId !== session.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return exam;
};
