import { TRPCError } from '@trpc/server';
import { Query, QueryCommand } from 'dynamodb-toolbox';
import groupBy from 'lodash/groupBy';
import { z } from 'zod';

import {
  ClassroomExamEntity,
  computeClassroomExamEntityPartitionKey,
  computeClassroomExamEntitySortKey,
  ExamTable,
  OrganizationTable,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomByExamList = authedProcedure
  .input(
    z.object({
      userId: z.string(),
      organizationId: z.string(),
    }),
  )
  .query(async ({ ctx: { session }, input: { userId, organizationId } }) => {
    const { admin } = validateOrganizationAccess(organizationId, session);
    if (!admin) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const classroomExamsQuery: Query<typeof OrganizationTable> = {
      partition: computeClassroomExamEntityPartitionKey({ organizationId }),
      range: {
        beginsWith: computeClassroomExamEntitySortKey({
          userId,
        }),
      },
    };

    const { Items: classroomExams } = await ExamTable.build(QueryCommand)
      .query(classroomExamsQuery)
      .entities(ClassroomExamEntity)
      .send();

    if (classroomExams === undefined) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
    }

    return Object.entries(
      groupBy(
        classroomExams
          .map(
            ({
              examName,
              examDate,
              classroomName,
              schoolPseudo,
              classroomId,
              examId,
              subject,
              schoolYear,
            }) => ({
              examId,
              examName,
              examDate,
              classroomName,
              schoolPseudo,
              classroomId,
              subject,
              schoolYear,
            }),
          )
          .sort((a, b) => -a.examDate.localeCompare(b.examDate)),
        'examId',
      ),
    )
      .map(([examId, classrooms]) => ({
        examId,
        examName: classrooms[0].examName,
        subject: classrooms[0].subject,
        classrooms: classrooms.map(
          ({
            classroomName,
            schoolPseudo,
            classroomId,
            examDate,
            schoolYear,
          }) => ({
            classroomName,
            schoolPseudo,
            classroomId,
            examDate,
            schoolYear,
          }),
        ),
      }))
      .filter(({ classrooms }) => classrooms.length > 0)
      .sort(
        (a, b) =>
          -a.classrooms[0].examDate.localeCompare(b.classrooms[0].examDate),
      );
  });
