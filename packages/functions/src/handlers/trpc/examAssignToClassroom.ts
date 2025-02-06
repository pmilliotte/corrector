import { TRPCError } from '@trpc/server';
import { GetItemCommand, PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import {
  ClassroomEntity,
  ClassroomExamEntity,
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
