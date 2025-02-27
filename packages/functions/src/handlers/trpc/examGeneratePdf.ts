import { PutObjectCommand } from '@aws-sdk/client-s3';
import Chromium from '@sparticuz/chromium';
import { TRPCError } from '@trpc/server';
import { GetItemCommand } from 'dynamodb-toolbox';
import { toDataURL } from 'qrcode';
import { Resource } from 'sst';
import { z } from 'zod';

import { s3Client } from '~/clients';
import { ExamEntity } from '~/libs';
import {
  generatePdfWithPuppeteer,
  YOUR_LOCAL_CHROMIUM_PATH,
} from '~/libs/puppeteer';
import { authedProcedure } from '~/trpc';

export const examGeneratePdf = authedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx: { session }, input: { id } }) => {
    const { id: userId } = session;

    const { Item: exam } = await ExamEntity.build(GetItemCommand)
      .key({ id, userId })
      .send();

    if (exam?.problems.configureProblems === undefined) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

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

    const src = await toDataURL(exam.name);

    const executablePath =
      process.env.SST_DEV === 'true'
        ? YOUR_LOCAL_CHROMIUM_PATH
        : await Chromium.executablePath();

    const pdfBuffer = await generatePdfWithPuppeteer({
      problems: configureProblems,
      mark,
      src,
      firstName: 'Prénom',
      lastName: 'Nom',
      schoolPseudo: "Nom de l'établissement",
      examName: "Nom de l'examen",
      executablePath,
    });

    const fileKey = `users/${userId}/exams/${exam.id}/subject.pdf`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: Resource['exam-bucket'].name,
        Key: fileKey,
        Body: pdfBuffer,
        ContentType: 'application/pdf',
      }),
    );
  });
