import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { SCHOOL_YEARS, SUBJECTS } from '@corrector/shared';

import { ExamTable } from '../tables';

export const CLASSROOM_EXAM_ENTITY_NAME = 'ClassroomExam';

const classroomExamSchema = schema({
  classroomId: string().key(),
  organizationId: string().key(),
  examId: string().key(),
  userId: string().key(),
  examDate: string(),
  subject: string().enum(...SUBJECTS),
  schoolYear: string().enum(...SCHOOL_YEARS),
  examName: string(),
  schoolPseudo: string(),
  classroomName: string(),
});

export const computeClassroomExamEntityPartitionKey = ({
  organizationId,
}: {
  organizationId: string;
}): string => `${CLASSROOM_EXAM_ENTITY_NAME}#organizationId=${organizationId}`;

export const computeClassroomExamEntitySortKey = ({
  examId,
  userId,
  classroomId,
}: {
  examId?: string;
  userId: string;
  classroomId?: string;
}): string => {
  if (classroomId === undefined) {
    return `userId=${userId}#`;
  }
  if (examId === undefined) {
    return `userId=${userId}#classroomId=${classroomId}#`;
  }

  return `userId=${userId}#classroomId=${classroomId}#examId=${examId}`;
};

export const ClassroomExamEntity = new Entity({
  name: CLASSROOM_EXAM_ENTITY_NAME,
  schema: classroomExamSchema,
  table: ExamTable,
  entityAttributeHidden: false,
  computeKey: ({ examId, classroomId, organizationId, userId }) => ({
    [PARTITION_KEY]: computeClassroomExamEntityPartitionKey({
      organizationId,
    }),
    [SORT_KEY]: computeClassroomExamEntitySortKey({
      classroomId,
      examId,
      userId,
    }),
  }),
});

export type ClassroomExam = FormattedItem<typeof ClassroomExamEntity>;
