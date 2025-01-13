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
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { position, type, problemId, examId, text },
    }) => {
      const { id: userId } = session;

      const { Item: exam } = await ExamEntity.build(GetItemCommand)
        .key({ id: examId, userId })
        .send();

      if (exam?.problems.configureProblems[problemId] === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const problemContent = exam.problems.configureProblems[problemId].content;

      problemContent.splice(position, 0, {
        text,
        id: randomUUID(),
        ...(type === 'question' ? { index: 1, type } : { type }),
      });

      const indexedProblemContent = reindexStatements(problemContent);

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            configureProblems: {
              [problemId]: {
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
