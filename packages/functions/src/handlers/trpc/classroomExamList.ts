import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  ClassroomExamEntity,
  computeClassroomExamEntityPartitionKey,
  computeClassroomExamEntitySortKey,
  ExamTable,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomExamList = authedProcedure
  .input(z.object({ classroomId: z.string(), organizationId: z.string() }))
  .query(
    async ({ ctx: { session }, input: { classroomId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      const { id: userId } = session;

      const query: Query<typeof ExamTable> = {
        partition: computeClassroomExamEntityPartitionKey({
          organizationId,
        }),
        range: {
          beginsWith: computeClassroomExamEntitySortKey({
            userId,
            classroomId,
          }),
        },
      };

      const { Items: exams } = await ExamTable.build(QueryCommand)
        .query(query)
        .entities(ClassroomExamEntity)
        .send();

      if (exams === undefined) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return exams.map(
        ({ [$entity]: _entityName, ...restOfExam }) => restOfExam,
      );
    },
  );
