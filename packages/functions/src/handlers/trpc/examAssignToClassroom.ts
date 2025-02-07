import { TRPCError } from '@trpc/server';
import {
  BatchPutRequest,
  BatchWriteCommand,
  executeBatchWrite,
  GetItemCommand,
  PutItemCommand,
  Query,
  QueryCommand,
} from 'dynamodb-toolbox';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import {
  ClassroomEntity,
  ClassroomExamAnswerEntity,
  ClassroomExamEntity,
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  ExamTable,
  OrganizationTable,
  UserClassroomEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examAssignToClassroom = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      examId: z.string(),
      organizationId: z.string(),
      examDate: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, classroomId, examId, examDate },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { name, subject } = await validateExamOwnership(
        { examId },
        session,
      );
      const { id: userId } = session;

      const { Item: classroom } = await ClassroomEntity.build(GetItemCommand)
        .key({
          id: classroomId,
          organizationId,
        })
        .send();

      if (classroom === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const query: Query<typeof OrganizationTable> = {
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
        .query(query)
        .entities(UserClassroomEntity)
        .send();

      if (classroomStudents === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const command = ExamTable.build(BatchWriteCommand).requests(
        ...classroomStudents.map(({ userId: studentId, lastName, firstName }) =>
          ClassroomExamAnswerEntity.build(BatchPutRequest).item({
            classroomId,
            organizationId,
            userId: studentId,
            lastName,
            firstName,
            examId,
            status: 'created',
          }),
        ),
      );

      await executeBatchWrite(command);

      await ClassroomExamEntity.build(PutItemCommand)
        .item({
          examId,
          classroomId,
          organizationId,
          examDate,
          userId,
          examName: name,
          classroomName: classroom.classroomName,
          schoolName: classroom.schoolName,
          subject,
        })
        .options({
          condition: {
            and: [
              {
                attr: 'examId',
                exists: false,
              },
              {
                attr: 'organizationId',
                exists: false,
              },
              {
                attr: 'classroomId',
                exists: false,
              },
            ],
          },
        })
        .send();
    },
  );
