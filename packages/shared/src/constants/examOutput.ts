import { z } from 'zod';

export const getExamOutputSchema = ({
  problemTitleDescription,
  problemPathDescription,
  questionPathDescription,
  questionStatementDescription,
  answerDescription,
  answerParagraphDescription,
  methodDescription,
  methodParagraphDescription,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<ProblemStructureDescription>) =>
  z
    .object({
      problems: getProblemSchema({
        problemTitleDescription,
        problemPathDescription,
        questionPathDescription,
        questionStatementDescription,
        answerDescription,
        answerParagraphDescription,
        methodDescription,
        methodParagraphDescription,
      }).array(),
    })
    .strict();

export type ExamOutput = z.infer<ReturnType<typeof getExamOutputSchema>>;

type ProblemStructureDescription = QuestionStructureDescription & {
  problemTitleDescription: string;
  problemPathDescription: string;
};

export const getProblemSchema = ({
  problemTitleDescription,
  problemPathDescription,
  questionPathDescription,
  questionStatementDescription,
  answerDescription,
  answerParagraphDescription,
  methodDescription,
  methodParagraphDescription,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<ProblemStructureDescription>) =>
  z
    .object({
      problemTitle: z.string().describe(problemTitleDescription ?? ''),
      problemPath: z.number().describe(problemPathDescription ?? ''),
      questions: getQuestionSchema({
        questionPathDescription,
        questionStatementDescription,
        answerDescription,
        answerParagraphDescription,
        methodDescription,
        methodParagraphDescription,
      }).array(),
    })
    .strict();

export type Problem = z.infer<ReturnType<typeof getProblemSchema>>;

type QuestionStructureDescription = {
  questionStatementDescription: string;
  questionPathDescription: string;
  answerDescription: string;
  answerParagraphDescription: string;
  methodDescription: string;
  methodParagraphDescription: string;
};

export const getQuestionSchema = ({
  questionStatementDescription,
  questionPathDescription,
  answerDescription,
  answerParagraphDescription,
  methodDescription,
  methodParagraphDescription,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<QuestionStructureDescription>) =>
  z.object({
    path: z.string().describe(questionPathDescription ?? ''),
    statement: z.string().describe(questionStatementDescription ?? ''),
    answer: z
      .array(z.string().describe(answerParagraphDescription ?? ''))
      .describe(answerDescription ?? ''),
    method: z
      .array(z.string().describe(methodParagraphDescription ?? ''))
      .describe(methodDescription ?? ''),
  });

export type Question = z.infer<ReturnType<typeof getQuestionSchema>>;

export const questionAnalysisSchema = z
  .object({
    statement: z.string(),
    path: z.string(),
    answer: z.string(),
    mark: z.number().min(0).optional(),
    method: z.array(z.string()),
  })
  .strict();

export type QuestionAnalysis = z.infer<typeof questionAnalysisSchema>;

export const problemAnalysisSchema = z
  .object({
    problemTitle: z.string(),
    problemPath: z.number(),
    questions: z.record(z.string(), questionAnalysisSchema.optional()),
  })
  .strict();

export type ProblemAnalysis = z.infer<typeof problemAnalysisSchema>;

export const examAnalysisSchema = z
  .object({
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
        propertyName: z.enum(['statement', 'answer']),
        value: z.string(),
      }),
    ),
  );

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
