import { TRPCError } from '@trpc/server';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import compact from 'lodash/compact';
import { z } from 'zod';

import { addMarks, ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examConfigureProblems = authedProcedure
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

    if (exam === undefined) {
      throw new TRPCError({ code: 'BAD_REQUEST' });
    }

    await ExamEntity.build(UpdateItemCommand)
      .item({
        id,
        userId,
        status: 'configureProblemsRequested',
      })
      .options({
        condition: {
          and: [
            {
              attr: 'id',
              exists: true,
            },
            {
              or: [
                {
                  attr: 'status',
                  eq: 'uploadFiles',
                },
                {
                  attr: 'status',
                  eq: 'configureProblemsRequested',
                },
              ],
            },
          ],
        },
      })
      .send();

    const {
      problems: { uploadFiles },
    } = exam;

    const configureProblems = compact(
      Object.values(uploadFiles).map(file => file?.problem),
    );

    try {
      const configureProblemsWithMarks = await addMarks(configureProblems);

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id,
          userId,
          status: 'configureProblems',
          problems: {
            uploadFiles: $set({}),
            configureProblems: $set(configureProblemsWithMarks),
          },
        })
        .options({
          condition: {
            and: [
              {
                attr: 'id',
                exists: true,
              },
              {
                attr: 'status',
                eq: 'configureProblemsRequested',
              },
            ],
          },
        })
        .send();
    } catch (e) {
      console.log(e);

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id,
          userId,
          status: 'uploadFiles',
        })
        .options({
          condition: {
            and: [
              {
                attr: 'id',
                exists: true,
              },
              {
                attr: 'status',
                eq: 'configureProblemsRequested',
              },
            ],
          },
        })
        .send();
    }
  });
