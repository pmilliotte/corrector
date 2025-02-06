import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ClassroomExamEntity, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const classroomExamGet = authedProcedure
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
      input: { classroomId, organizationId, examId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const { id: userId } = session;

      const { Item: classroomExam } = await ClassroomExamEntity.build(
        GetItemCommand,
      )
        .key({
          classroomId,
          organizationId,
          examId,
          userId,
        })
        .send();

      if (classroomExam === undefined) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return classroomExam;
    },
  );
