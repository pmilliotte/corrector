import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { SUBJECTS } from '@corrector/shared';

import { ExamTable } from '../tables';

export const CLASSROOM_EXAM_ENTITY_NAME = 'ClassroomExam';

const classroomExamSchema = schema({
  classroomId: string().key(),
  organizationId: string().key(),
  examId: string().key(),
  examDate: string(),
  userId: string().key(),
  subject: string().enum(...SUBJECTS),
  name: string(),
});

export const computeClassroomExamEntityPartitionKey = ({
  classroomId,
  organizationId,
}: {
  classroomId: string;
  organizationId: string;
}): string =>
  `${CLASSROOM_EXAM_ENTITY_NAME}#organizationId=${organizationId}#classroomId=${classroomId}`;

export const computeClassroomExamEntitySortKey = ({
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

export const ClassroomExamEntity = new Entity({
  name: CLASSROOM_EXAM_ENTITY_NAME,
  schema: classroomExamSchema,
  table: ExamTable,
  entityAttributeHidden: false,
  computeKey: ({ classroomId, examId, organizationId, userId }) => ({
    [PARTITION_KEY]: computeClassroomExamEntityPartitionKey({
      organizationId,
      classroomId,
    }),
    [SORT_KEY]: computeClassroomExamEntitySortKey({
      examId,
      userId,
    }),
  }),
});

export type ClassroomExam = FormattedItem<typeof ClassroomExamEntity>;
