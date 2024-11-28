import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { DIVISIONS, EXAM_STATUSES, Subject, SUBJECTS } from '@corrector/shared';

import { ExamTable } from '../table';

export const EXAM_ENTITY_NAME = 'Exam';

const examSchema = schema({
  id: string().key(),
  subject: string().enum(...SUBJECTS),
  division: string().enum(...DIVISIONS),
  organizationId: string().key(),
  userId: string(),
  name: string(),
  status: string().enum(...EXAM_STATUSES),
});

export const computeExamEntityLSI1SortKey = ({
  examId,
  organizationId,
  subject,
  userId,
}: {
  examId?: string;
  organizationId: string;
  subject?: Subject;
  userId?: string;
}): string => {
  if (subject === undefined) {
    return `organizationId=${organizationId}#`;
  }
  if (userId === undefined) {
    return `organizationId=${organizationId}#subject=${subject}#`;
  }
  if (examId === undefined) {
    return `organizationId=${organizationId}#subject=${subject}#userId=${userId}#`;
  }

  return `organizationId=${organizationId}#subject=${subject}#userId=${userId}#examId=${examId}`;
};

export const computeExamEntitySortKey = ({
  examId,
  organizationId,
}: {
  examId?: string;
  organizationId: string;
}): string => {
  if (examId === undefined) {
    return `organizationId=${organizationId}#`;
  }

  return `organizationId=${organizationId}#examId=${examId}`;
};

export const ExamEntity = new Entity({
  name: EXAM_ENTITY_NAME,
  schema: examSchema,
  table: ExamTable,
  entityAttributeHidden: true,
  computeKey: ({ id, organizationId }) => ({
    [PARTITION_KEY]: EXAM_ENTITY_NAME,
    [SORT_KEY]: computeExamEntitySortKey({
      organizationId,
      examId: id,
    }),
  }),
});

export type Exam = FormattedItem<typeof ExamEntity>;
