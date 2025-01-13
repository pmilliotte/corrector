import { TRPCError } from '@trpc/server';
import { $set, GetItemCommand, UpdateItemCommand } from 'dynamodb-toolbox';
import { z } from 'zod';

import { Exam, ExamEntity } from '~/libs';
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

      if (exam?.problems.configureProblems[problemId] === undefined) {
        throw new TRPCError({ code: 'BAD_REQUEST' });
      }

      const problemContent = exam.problems.configureProblems[problemId].content;
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

type ProblemContent = NonNullable<
  Exam['problems']['configureProblems'][0]
>['content'];

const reindexStatements = (content: ProblemContent) => {
  let questionIndex = 0;

  return content.reduce((acc, statement) => {
    if (statement.type === 'statement') {
      return [...acc, statement];
    }

    questionIndex++;

    return [...acc, { ...statement, index: questionIndex }];
  }, [] as ProblemContent);
};
