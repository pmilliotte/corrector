import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';

import { OrganizationTable } from '../tables';

export const CLASSROOM_EXAM_ENTITY_NAME = 'ClassroomExam';

const classroomExamSchema = schema({
  classroomId: string().key(),
  organizationId: string().key(),
  examId: string().key(),
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
}: {
  examId: string;
}): string => `examId=${examId}`;

export const ClassroomExamEntity = new Entity({
  name: CLASSROOM_EXAM_ENTITY_NAME,
  schema: classroomExamSchema,
  table: OrganizationTable,
  entityAttributeHidden: false,
  computeKey: ({ classroomId, examId, organizationId }) => ({
    [PARTITION_KEY]: computeClassroomExamEntityPartitionKey({
      organizationId,
      classroomId,
    }),
    [SORT_KEY]: computeClassroomExamEntitySortKey({
      examId,
    }),
  }),
});

export type ClassroomExam = FormattedItem<typeof ClassroomExamEntity>;
