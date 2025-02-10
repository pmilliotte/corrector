import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { TRPCError } from '@trpc/server';
import { Query, QueryCommand } from 'dynamodb-toolbox';
import compact from 'lodash/compact';
import { Resource } from 'sst';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import { s3Client } from '~/clients';
import {
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  listObjectPrefixRawData,
  OrganizationTable,
  splitAnswers,
  UserClassroomEntity,
  validateClassroomWriteAccess,
  validateOrganizationAccess,
} from '~/libs';
import { authedProcedure } from '~/trpc';

export const examAnswersSplit = authedProcedure
  .input(
    z.object({
      classroomId: z.string(),
      examId: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { organizationId, examId, classroomId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      await validateClassroomWriteAccess(
        { organizationId, classroomId },
        session,
      );

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

      if (classroomStudents === undefined || classroomStudents.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }
      const pdfAnswersKeyPrefix = `organizations/${organizationId}/classrooms/${classroomId}/exams/${examId}`;

      const { LastModified } = await s3Client.send(
        new HeadObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: `${pdfAnswersKeyPrefix}/answers.pdf`,
        }),
      );

      if (LastModified === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const anwerImagesRawData = await listObjectPrefixRawData({
        bucketName: Resource['exam-bucket'].name,
        prefix: `${pdfAnswersKeyPrefix}/answers-as-images/${LastModified.toISOString()}`,
      });

      const { answerPagesByStudent } = await splitAnswers({
        imagesAsBase64: anwerImagesRawData,
        classroomStudents: compact(
          classroomStudents.map(({ firstName, lastName, userId }) =>
            firstName !== undefined && lastName !== undefined
              ? {
                  firstName,
                  lastName,
                  uuid: userId,
                }
              : undefined,
          ),
        ),
      });

      console.log(answerPagesByStudent);
    },
  );
