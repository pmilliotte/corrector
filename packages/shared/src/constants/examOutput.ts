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

export type Question = z.infer<ReturnType<typeof getQuestionSchema>>;

export const questionAnalysisSchema = z
  .object({
    questionStatement: z.string(),
    questionPath: z.string(),
    answer: z.string(),
    mark: z.number().min(0).optional(),
  })
  .strict();

export type QuestionAnalysis = z.infer<typeof questionAnalysisSchema>;

export const problemAnalysisSchema = z
  .object({
    problemTitle: z.string(),
    problemPath: z.string(),
    questions: z.record(z.string(), questionAnalysisSchema.optional()),
  })
  .strict();

export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;

export const examAnalysisSchema = z
  .object({
    examTitle: z.string(),
    problems: z.record(z.string(), problemAnalysisSchema.optional()),
  })
  .strict();

export type ExamAnalysis = z.infer<typeof examAnalysisSchema>;

const questionIdSchema = z
  .object({
    problemId: z.string(),
    questionId: z.string(),
  })
  .strict();

export const updateQuestionSchema = questionIdSchema
  .merge(z.object({ propertyName: z.enum(['mark']), value: z.number().min(0) }))
  .or(
    questionIdSchema.merge(
      z.object({
        propertyName: z.enum(['questionStatement', 'answer']),
        value: z.string(),
      }),
    ),
  );

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
