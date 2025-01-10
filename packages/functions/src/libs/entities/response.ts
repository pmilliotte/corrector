import { Entity, FormattedItem, schema, string } from 'dynamodb-toolbox';

import { PARTITION_KEY, SORT_KEY } from '@corrector/backend-shared';
import { EXAM_STATUSES } from '@corrector/shared';

import { ExamTable } from '../tables';

export const RESPONSE_ENTITY_NAME = 'Response';

const responseSchema = schema({
  id: string().key(),
  organizationId: string().key(),
  examId: string().key(),
  userId: string(),
  filename: string().optional(),
  status: string().enum(...EXAM_STATUSES),
  uploadedAt: string().optional(),
});

export const computeResponseEntitySortKey = ({
  examId,
  organizationId,
  responseId,
}: {
  responseId?: string;
  examId?: string;
  organizationId: string;
}): string => {
  if (examId === undefined) {
    return `organizationId=${organizationId}#`;
  }
  if (responseId === undefined) {
    return `organizationId=${organizationId}#examId=${examId}#`;
  }

  return `organizationId=${organizationId}#examId=${examId}#responseId=${responseId}`;
};

export const ResponseEntity = new Entity({
  name: RESPONSE_ENTITY_NAME,
  schema: responseSchema,
  table: ExamTable,
  entityAttributeHidden: true,
  computeKey: ({ id, organizationId, examId }) => ({
    [PARTITION_KEY]: RESPONSE_ENTITY_NAME,
    [SORT_KEY]: computeResponseEntitySortKey({
      organizationId,
      examId,
      responseId: id,
    }),
  }),
});

export type Response = FormattedItem<typeof ResponseEntity>;
