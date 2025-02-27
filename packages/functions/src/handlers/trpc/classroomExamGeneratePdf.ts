import { PutObjectCommand } from '@aws-sdk/client-s3';
import Chromium from '@sparticuz/chromium';
import { TRPCError } from '@trpc/server';
import { GetItemCommand, Query, QueryCommand } from 'dynamodb-toolbox';
import chunk from 'lodash/chunk';
import compact from 'lodash/compact';
import { PDFDocument } from 'pdf-lib';
import { toDataURL } from 'qrcode';
import { Resource } from 'sst';
import { z } from 'zod';

import { LSI1 } from '@corrector/backend-shared';

import { s3Client } from '~/clients';
import {
  ClassroomExamEntity,
  computeUserClassroomEntityLSI1Key,
  computeUserClassroomEntityPartitionKey,
  OrganizationTable,
  UserClassroomEntity,
  validateExamOwnership,
  validateOrganizationAccess,
} from '~/libs';
import {
  generatePdfWithPuppeteer,
  YOUR_LOCAL_CHROMIUM_PATH,
} from '~/libs/puppeteer';
import { authedProcedure } from '~/trpc';

export const classroomExamGeneratePdf = authedProcedure
  .input(
    z.object({
      examId: z.string(),
      organizationId: z.string(),
      classroomId: z.string(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { examId, organizationId, classroomId },
    }) => {
      validateOrganizationAccess(organizationId, session);
      const exam = await validateExamOwnership({ examId }, session);

      const { id: userId } = session;

      const {
        problems: { configureProblems },
      } = exam;

      const mark = configureProblems.reduce(
        (accProblem, { content }) =>
          accProblem +
          content.reduce(
            (accStatement, statement) =>
              statement.type === 'question'
                ? accStatement + statement.mark
                : accStatement,
            0,
          ),
        0,
      );

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

      if (classroomStudents === undefined || classroomStudents.length === 0) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const executablePath =
        process.env.SST_DEV === 'true'
          ? YOUR_LOCAL_CHROMIUM_PATH
          : await Chromium.executablePath();

      const buffers: Buffer[] = [];

      // Avoid /tmp usage failure
      for (const students of chunk(classroomStudents, 10)) {
        const studentBuffers = await Promise.all(
          students.map(async ({ lastName, firstName }) => {
            if (firstName === undefined || lastName === undefined) {
              return;
            }

            const src = await toDataURL(`${firstName} ${lastName}`);

            const pdfBuffer = await generatePdfWithPuppeteer({
              problems: configureProblems,
              mark,
              src,
              firstName,
              lastName,
              schoolPseudo: classroomExam.schoolPseudo,
              examName: classroomExam.examName,
              executablePath,
            });

            return pdfBuffer;
          }),
        );

        buffers.push(...compact(studentBuffers));
      }

      const mergedPdf = await PDFDocument.create();
      for (const pdfBytes of buffers) {
        const pdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdf,
          pdf.getPageIndices(),
        );
        copiedPages.forEach(page => {
          mergedPdf.addPage(page);
        });
      }

      const pdf = await mergedPdf.save();

      const fileKey = `organizations/${organizationId}/classrooms/${classroomId}/exams/${examId}/subject.pdf`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Resource['exam-bucket'].name,
          Key: fileKey,
          Body: pdf,
          ContentType: 'application/pdf',
        }),
      );
    },
  );
