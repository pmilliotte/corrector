import {
  anyOf,
  Entity,
  FormattedItem,
  list,
  map,
  number,
  record,
  schema,
  string,
} from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { DIVISIONS, EXAM_STATUSES, SUBJECTS } from '@corrector/shared';

import { ExamTable } from '../tables';

export const EXAM_ENTITY_NAME = 'Exam';

const statementSchema = map({
  type: string().const('statement'),
  text: string(),
  id: string(),
  numberOfLines: number(),
});

const questionSchema = map({
  type: string().const('question'),
  text: string(),
  id: string(),
  index: number(),
  numberOfLines: number(),
});

const problemSchema = map({
  content: list(anyOf(statementSchema, questionSchema)),
});

const examSchema = schema({
  id: string().key(),
  userId: string().key(),
  subject: string().enum(...SUBJECTS),
  division: string().enum(...DIVISIONS),
  organizationId: string(),
  name: string(),
  status: string().enum(...EXAM_STATUSES),
  problems: map({
    uploadFiles: record(string(), record(string(), problemSchema)),
    configureProblems: record(string(), problemSchema),
  })
    .default({ uploadFiles: {}, configureProblems: {} })
    .required(),
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
