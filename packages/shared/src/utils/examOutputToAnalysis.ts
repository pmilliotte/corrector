import crypto from 'crypto';

import {
  ExamAnalysis,
  ExamOutput,
  ProblemAnalysis,
  QuestionAnalysis,
  QuestionOutput,
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
        questions: problem.questions.reduce(
          (accQuestions, question) => ({
            ...accQuestions,
            ...getQuestionWithUuid(question),
          }),
          {},
        ),
      },
    }),
    {},
  ),
});

const getQuestionWithUuid = (
  question: QuestionOutput,
): Record<string, QuestionAnalysis> => ({
  [crypto.randomUUID()]: {
    ...question,
    mark: 0,
    instructions: '',
    method: question.method.map(methodStep => ({
      ...methodStep,
      id: crypto.randomUUID(),
      mark: 0,
    })),
  },
});
