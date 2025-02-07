import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { CLASSROOM_EXAM_ANSWER_STATUSES } from '@corrector/shared';

import { ExamTable } from '../tables';

export const CLASSROOM_EXAM_ANSWER_ENTITY_NAME = 'ClassroomExamAnswer';

const classroomExamAnswerSchema = schema({
  classroomId: string().key(),
  organizationId: string().key(),
  examId: string().key(),
  userId: string().key(),
  firstName: string().optional(),
  lastName: string().optional(),
  status: string().enum(...CLASSROOM_EXAM_ANSWER_STATUSES),
});

export const computeClassroomExamAnswerEntityPartitionKey = ({
  classroomId,
  organizationId,
  examId,
}: {
  classroomId: string;
  organizationId: string;
  examId: string;
}): string =>
  `${CLASSROOM_EXAM_ANSWER_ENTITY_NAME}#organizationId=${organizationId}#classroomId=${classroomId}#examId=${examId}`;

export const computeClassroomExamAnswerEntitySortKey = ({
  userId,
}: {
  userId: string;
}): string => `userId=${userId}`;

export const ClassroomExamAnswerEntity = new Entity({
  name: CLASSROOM_EXAM_ANSWER_ENTITY_NAME,
  schema: classroomExamAnswerSchema,
  table: ExamTable,
  entityAttributeHidden: false,
  computeKey: ({ classroomId, examId, organizationId, userId }) => ({
    [PARTITION_KEY]: computeClassroomExamAnswerEntityPartitionKey({
      organizationId,
      classroomId,
      examId,
    }),
    [SORT_KEY]: computeClassroomExamAnswerEntitySortKey({
      userId,
    }),
  }),
});

export type ClassroomExamAnswer = FormattedItem<
  typeof ClassroomExamAnswerEntity
>;
