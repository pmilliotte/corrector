import { z } from 'zod';

type ExamOutputStructureDescription = ProblemStructureDescription & {
  examTitle: string;
};

export const getExamOutputSchema = ({
  examTitle,
  problemTitle,
  problemPath,
  questionPath,
  questionStatement,
  answer,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<ExamOutputStructureDescription>) =>
  z
    .object({
      examTitle:
        examTitle !== undefined ? z.string().describe(examTitle) : z.string(),
      problems: getProblemSchema({
        problemTitle,
        problemPath,
        questionPath,
        questionStatement,
        answer,
      }).array(),
    })
    .strict();

export type ExamOutput = z.infer<ReturnType<typeof getExamOutputSchema>>;

type ProblemStructureDescription = QuestionStructureDescription & {
  problemTitle: string;
  problemPath: string;
};

export const getProblemSchema = ({
  problemTitle,
  problemPath,
  questionPath,
  questionStatement,
  answer,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<ProblemStructureDescription>) =>
  z
    .object({
      problemTitle: z.string().describe(problemTitle ?? ''),
      problemPath: z.string().describe(problemPath ?? ''),
      questions: getQuestionSchema({
        questionPath,
        questionStatement,
        answer,
      }).array(),
    })
    .strict();

export type Problem = z.infer<ReturnType<typeof getProblemSchema>>;

type QuestionStructureDescription = {
  questionStatement: string;
  questionPath: string;
  answer: string;
};

export const getQuestionSchema = ({
  questionStatement,
  questionPath,
  answer,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<QuestionStructureDescription>) =>
  z
    .object({
      questionStatement: z.string().describe(questionStatement ?? ''),
      questionPath: z.string().describe(questionPath ?? ''),
      answer: z.string().describe(answer ?? ''),
    })
    .strict();
