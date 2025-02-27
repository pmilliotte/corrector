import { TRPCError } from '@trpc/server';
import { PutItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';
import differenceBy from 'lodash/differenceBy';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import {
  ClassroomExamAnswerEntity,
  computeClassroomExamAnswerEntityPartitionKey,
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  ExamTable,
  OrganizationTable,
  UserClassroomEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomExamAnswerRefresh = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      organizationId: z.string(),
      examId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, classroomId, examId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateExamOwnership({ examId }, session);

      const examAnswersQuery: Query<typeof OrganizationTable> = {
        partition: computeClassroomExamAnswerEntityPartitionKey({
          organizationId,
          classroomId,
          examId,
        }),
      };

      const { Items: classroomExamAnswers } = await ExamTable.build(
        QueryCommand,
      )
        .query(examAnswersQuery)
        .entities(ClassroomExamAnswerEntity)
        .send();

      const classroomStudentsQuery: Query<typeof OrganizationTable> = {
        partition: computeUserClassroomEntityPartitionKey({ organizationId }),
        index: LSI1,
        range: {
          beginsWith: computeUserClassroomEntityLSI1Key({
            classroomId,
            userType: 'student',
          }),
        },
      };

      const { Items: classroomStudents } = await OrganizationTable.build(
        QueryCommand,
      )
        .query(classroomStudentsQuery)
        .entities(UserClassroomEntity)
        .send();

      if (
        classroomStudents === undefined ||
        classroomExamAnswers === undefined
      ) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const newStudents = differenceBy(
        classroomStudents,
        classroomExamAnswers,
        ({ userId }: { userId: string }) => userId,
      );

      await Promise.all(
        newStudents.map(({ userId: studentId, lastName, firstName }) =>
          ClassroomExamAnswerEntity.build(PutItemCommand)
            .item({
              classroomId,
              organizationId,
              userId: studentId,
              lastName,
              firstName,
              examId,
              status: 'created',
            })
            .send(),
        ),
      );
    },
  );
