import {
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { HumanMessage } from '@langchain/core/messages';
import { TRPCError } from '@trpc/server';
import { UpdateItemCommand } from 'dynamodb-toolbox';
import { Bucket } from 'sst/node/bucket';
import { z } from 'zod';

import {
  EXAM_BLANK,
  examOutputToAnalysis,
  getExamOutputSchema,
} from '@corrector/shared';

import { s3Client } from '~/clients';
import { validateOrganizationAccess } from '~/libs';
import { authedProcedure } from '~/trpc';

import {
  ExamEntity,
  getChain,
  getFileKeyPrefix,
  i18n,
  validateExamOwnership,
} from '../libs';

export const examSubjectAnalyze = authedProcedure
  .input(
    z.object({
      id: z.string(),
      organizationId: z.string(),
    }),
  )
  .mutation(
    async ({ ctx: { session }, input: { id: examId, organizationId } }) => {
      validateOrganizationAccess(organizationId, session);
      const { subject, division, status } = await validateExamOwnership(
        { examId, organizationId },
        session,
      );

      if (status !== 'imagesUploaded') {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const { id: userId } = session;

      const fileKeyPrefix = getFileKeyPrefix({
        organizationId,
        userId,
        examId,
      });

      const imagesPrefix = `${fileKeyPrefix}/${EXAM_BLANK}/images/`;

      const listCommand = new ListObjectsV2Command({
        Bucket: Bucket['exam-bucket'].bucketName,
        Prefix: imagesPrefix,
      });
      const { Contents, KeyCount } = await s3Client.send(listCommand);

      if (KeyCount === undefined || Contents === undefined) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }

      const examImageContent = await Contents.reduce<
        Promise<
          {
            type: 'image_url';
            image_url: {
              url: string;
            };
          }[]
        >
      >(async (accP, item) => {
        const acc = await accP;

        if (item.Key === undefined) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const { Body: rawData } = await s3Client.send(
          new GetObjectCommand({
            Key: item.Key,
            Bucket: Bucket['exam-bucket'].bucketName,
          }),
        );

        if (rawData === undefined) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
        }

        const base64 = await rawData.transformToString('base64');

        return [
          ...acc,
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
            },
          },
        ];
      }, Promise.resolve([]));

      const chain = getChain({
        subject,
        division,
      });

      const examAnalysisHumanMessage = i18n.__('examAnalysis.humanMessage');

      const humanMessage = new HumanMessage({
        content: [
          {
            type: 'text',
            text: examAnalysisHumanMessage,
          },
          ...examImageContent,
        ],
      });

      const response = await chain.invoke({ blankExam: [humanMessage] });

      const examOutput = getExamOutputSchema({}).parse(response);

      await s3Client.send(
        new PutObjectCommand({
          Bucket: Bucket['exam-bucket'].bucketName,
          Key: `${fileKeyPrefix}/${EXAM_BLANK}/analysis.json`,
          Body: JSON.stringify(examOutputToAnalysis(examOutput)),
        }),
      );

      await ExamEntity.build(UpdateItemCommand)
        .item({ id: examId, organizationId, status: 'marks' })
        .send();
    },
  );
