import { TRPCError } from '@trpc/server';
import { randomUUID } from 'crypto';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity, reindexStatements } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examStatementInsert = authedProcedure
  .input(
    z.object({
      problemId: z.string(),
      position: z.number(),
      text: z.string(),
      type: z.enum(['statement', 'question']),
      examId: z.string(),
      numberOfLines: z.number().optional(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { position, type, problemId, examId, text, numberOfLines },
    }) => {
      const { id: userId } = session;

      const { Item: exam } = await ExamEntity.build(GetItemCommand)
        .key({ id: examId, userId })
        .send();

      const problemIndex = exam?.problems.configureProblems.findIndex(
        ({ id }) => id === problemId,
      );
      if (problemIndex === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const problem = exam?.problems.configureProblems[problemIndex];
      if (problem === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const problemContent = problem.content;

      problemContent.splice(position, 0, {
        text,
        id: randomUUID(),
        ...(type === 'question'
          ? { index: 1, type, numberOfLines: numberOfLines ?? 1, mark: 0 }
          : { type }),
      });

      const indexedProblemContent = reindexStatements(problemContent);

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            configureProblems: {
              [problemIndex]: {
                content: $set(indexedProblemContent),
              },
            },
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
                eq: 'configureProblems',
              },
            ],
          },
        })
        .send();
    },
  );
