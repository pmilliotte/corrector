import { PutItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ClassroomExamEntity, validateOrganizationAccess } from '~/libs';
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

      await ClassroomExamEntity.build(PutItemCommand)
        .item({
          examId,
          classroomId,
          organizationId,
          examDate,
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
