import { TRPCError } from '@trpc/server';
import { $entity, Query, QueryCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  ClassroomExamAnswerEntity,
  computeClassroomExamAnswerEntityPartitionKey,
  ExamTable,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomExamAnswerList = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      organizationId: z.string(),
      examId: z.string(),
    }),
  )
  .query(
    async ({
      ctx: { session },
      input: { organizationId, classroomId, examId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId }, session);

      const query: Query<typeof ExamTable> = {
        partition: computeClassroomExamAnswerEntityPartitionKey({
          organizationId,
          classroomId,
          examId,
        }),
      };

      const { Items: classroomExamAnswers } = await ExamTable.build(
        QueryCommand,
      )
        .query(query)
        .entities(ClassroomExamAnswerEntity)
        .send();

      if (classroomExamAnswers === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      return {
        classroomExamAnswers: classroomExamAnswers.map(
          ({ [$entity]: _entityName, ...restOfAnswer }) => restOfAnswer,
        ),
      };
    },
  );
