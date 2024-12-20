import { z } from 'zod';

export const getExamOutputSchema = ({
  problemTitleDescription,
  problemPathDescription,
  questionPathDescription,
  questionStatementDescription,
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
        answerParagraphDescription,
        methodDescription,
        methodParagraphDescription,
      }).array(),
    })
    .strict();

export type ProblemOutput = z.infer<ReturnType<typeof getProblemSchema>>;

type QuestionStructureDescription = {
  questionStatementDescription: string;
  questionPathDescription: string;
  answerParagraphDescription: string;
  methodDescription: string;
  methodParagraphDescription: string;
};

export const getQuestionSchema = ({
  questionStatementDescription,
  questionPathDescription,
  answerParagraphDescription,
  methodDescription,
  methodParagraphDescription,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<QuestionStructureDescription>) =>
  z.object({
    path: z.string().describe(questionPathDescription ?? ''),
    statement: z.string().describe(questionStatementDescription ?? ''),
    method: z
      .object({
        step: z.string().describe(methodParagraphDescription ?? ''),
        answer: z.string().describe(answerParagraphDescription ?? ''),
      })
      .strict()
      .array()
      .describe(methodDescription ?? ''),
  });

const methodAnalysisSchema = z
  .object({
    step: z.string(),
    answer: z.string(),
    mark: z.number().min(0),
    id: z.string(),
  })
  .strict();

export type Method = z.infer<typeof methodAnalysisSchema>;

export type QuestionOutput = z.infer<ReturnType<typeof getQuestionSchema>>;

export const questionAnalysisSchema = z
  .object({
    statement: z.string(),
    path: z.string(),
    mark: z.number().min(0),
    method: methodAnalysisSchema.array(),
    instructions: z.string().optional(),
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
  .merge(
    z.object({ propertyName: z.literal('mark'), value: z.number().min(0) }),
  )
  .or(
    questionIdSchema.merge(
      z.object({
        propertyName: z.enum(['statement', 'instructions']),
        value: z.string(),
      }),
    ),
  );

export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export const updateQuestionMethodSchema = questionIdSchema.merge(
  z.object({
    value: z.object({
      mark: z.number().min(0),
      step: z.string(),
      answer: z.string(),
      id: z.string(),
    }),
  }),
);

export type UpdateQuestionMethodInput = z.infer<
  typeof updateQuestionMethodSchema
>;
