import crypto from 'crypto';

import {
  ExamAnalysis,
  ExamOutput,
  ProblemAnalysis,
  QuestionAnalysis,
} from '~/constants';

export const examOutputToAnalysis = (examOutput: ExamOutput): ExamAnalysis => ({
  ...examOutput,
  problems: examOutput.problems.reduce<{
    [key: string]: ProblemAnalysis;
  }>(
    (accProblem, problem) => ({
      ...accProblem,
      [crypto.randomUUID()]: {
        ...problem,
        questions: problem.questions.reduce<{
          [key: string]: QuestionAnalysis;
        }>(
          (accQuestion, question) => ({
            ...accQuestion,
            [crypto.randomUUID()]: {
              ...question,
              answer: question.answer.join('\n\n'),
            },
          }),
          {},
        ),
      },
    }),
    {},
  ),
});
