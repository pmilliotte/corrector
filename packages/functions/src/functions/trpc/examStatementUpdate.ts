import { TRPCError } from '@trpc/server';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { MAX_NUMBER_OF_LINES, MIN_NUMBER_OF_LINES } from '@corrector/shared';

import { ExamEntity } from '~/libs';
import { authedProcedure } from '~/trpc';

export const examStatementUpdate = authedProcedure
  .input(
    z.object({
      problemId: z.string(),
      statementId: z.string(),
      examId: z.string(),
      text: z.string(),
      numberOfLines: z.coerce
        .number()
        .min(MIN_NUMBER_OF_LINES)
        .max(MAX_NUMBER_OF_LINES)
        .optional(),
    }),
  )
  .mutation(
    async ({
      ctx: { session },
      input: { statementId, problemId, examId, text, numberOfLines },
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
      const updatedProblemContent = problemContent.map(statement => {
        if (statement.id !== statementId) {
          return statement;
        }
        if (statement.type === 'statement' || numberOfLines === undefined) {
          return { ...statement, text };
        }

        return { ...statement, text, numberOfLines };
      });

      await ExamEntity.build(UpdateItemCommand)
        .item({
          id: examId,
          userId,
          problems: {
            configureProblems: {
              [problemIndex]: {
                content: $set(updatedProblemContent),
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
