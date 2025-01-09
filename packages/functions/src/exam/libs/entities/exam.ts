import {
  Entity,
  FormattedItem,
  list,
  map,
  record,
  schema,
  string,
} from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { DIVISIONS, EXAM_STATUSES, SUBJECTS } from '@corrector/shared';

import { ExamTable } from '../table';

export const EXAM_ENTITY_NAME = 'Exam';

const problemSchema = map({
  content: list(
    map({ type: string().enum('statement', 'question'), text: string() }),
  ),
});

const examSchema = schema({
  id: string().key(),
  userId: string().key(),
  subject: string().enum(...SUBJECTS),
  division: string().enum(...DIVISIONS),
  organizationId: string(),
  name: string(),
  status: string().enum(...EXAM_STATUSES),
  problems: record(string(), list(problemSchema)).default({}).required(),
});

export const computeExamEntitySortKey = ({
  examId,
  userId,
}: {
  examId?: string;
  userId: string;
}): string => {
  if (examId === undefined) {
    return `userId=${userId}#`;
  }

  return `userId=${userId}#examId=${examId}`;
};

export const ExamEntity = new Entity({
  name: EXAM_ENTITY_NAME,
  schema: examSchema,
  table: ExamTable,
  entityAttributeHidden: true,
  computeKey: ({ id, userId }) => ({
    [PARTITION_KEY]: EXAM_ENTITY_NAME,
    [SORT_KEY]: computeExamEntitySortKey({
      userId,
      examId: id,
    }),
  }),
});

export type Exam = FormattedItem<typeof ExamEntity>;
