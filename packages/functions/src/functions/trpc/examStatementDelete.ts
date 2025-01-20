import { TRPCError } from '@trpc/server';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { ExamEntity, reindexStatements } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examStatementDelete = authedProcedure
  .input(
    z.object({
      problemId: z.string(),
      statementId: z.string(),
      examId: z.string(),
    }),
  )
  .mutation(
    async ({ ctx: { session }, input: { statementId, problemId, examId } }) => {
      const { id: userId } = session;

      const { Item: exam } = await ExamEntity.build(GetItemCommand)
        .key({ id: examId, userId })
        .send();

      const problem = exam?.problems.configureProblems[problemId];

      if (problem === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const problemContent = problem.content;
      const filteredProblemContent = problemContent.filter(
        statement => statement.id !== statementId,
      );
      const indexedProblemContent = reindexStatements(filteredProblemContent);

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
