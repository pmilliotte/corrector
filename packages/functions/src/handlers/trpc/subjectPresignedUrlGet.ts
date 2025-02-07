import { GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { validateExamOwnership, validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

export const subjectPresignedUrlGet = authedProcedure
  .input(
    z.discriminatedUnion('entity', [
      z.object({
        entity: z.literal('exam'),
        examId: z.string(),
      }),
      z.object({
        organizationId: z.string(),
        classroomId: z.string(),
        entity: z.literal('classroomExam'),
        examId: z.string(),
      }),
    ]),
  )
  .query(async ({ ctx: { session }, input }) => {
    await validateExamOwnership({ examId: input.examId }, session);

    const { id: userId } = session;

    let Key: string;

    switch (input.entity) {
      case 'exam': {
        Key = `users/${userId}/exams/${input.examId}/subject.pdf`;
        break;
      }
      case 'classroomExam': {
        const { organizationId, classroomId, examId } = input;
        validateOrganizationAccess(organizationId, session);
        Key = `organizations/${organizationId}/classrooms/${classroomId}/exams/${examId}/subject.pdf`;
        break;
      }
    }

    try {
      await s3Client.send(
        new HeadObjectCommand({ Bucket: Resource['exam-bucket'].name, Key }),
      );
    } catch {
      return { exists: false as const };
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: Resource['exam-bucket'].name,
        Key,
      }),
      { expiresIn: 300 },
    );

    return { exists: true as const, url };
  });
