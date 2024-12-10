import crypto from 'crypto';

import { ExamAnalysis, ExamOutput, Problem, Question } from '~/constants';

export const examOutputToAnalysis = (examOutput: ExamOutput): ExamAnalysis => ({
  ...examOutput,
  problems: examOutput.problems.reduce<{
    [key: string]: Omit<Problem, 'questions'> & {
      questions: { [key: string]: Question };
    };
  }>(
    (accProblem, problem) => ({
      ...accProblem,
      [crypto.randomUUID()]: {
        ...problem,
        questions: problem.questions.reduce<{ [key: string]: Question }>(
          (accQuestion, question) => ({
            ...accQuestion,
            [crypto.randomUUID()]: question,
          }),
          {},
        ),
      },
    }),
    {},
  ),
});
