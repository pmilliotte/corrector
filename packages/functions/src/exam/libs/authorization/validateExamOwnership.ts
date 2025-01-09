import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';

import { Session } from '@corrector/shared';

import { Exam, ExamEntity } from '../entities';

export const validateExamOwnership = async (
  { examId }: { examId: string },
  session: Session,
): Promise<Exam> => {
  const { Item: exam } = await ExamEntity.build(GetItemCommand)
    .key({ id: examId, userId: session.id })
    .send();

  if (exam === undefined || exam.userId !== session.id) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return exam;
};
