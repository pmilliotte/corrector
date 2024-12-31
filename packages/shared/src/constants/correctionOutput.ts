import { z } from 'zod';

export const correctionOutputSchema = z.object({
  studentAnswersAnalysis: z
    .object({
      totalAndFaithfulStudentReasoningTranscript: z.string(),
      correction: z.string(),
      studentScore: z.number(),
      questionUuid: z.string(),
      problemUuid: z.string(),
      studentHasAnsweredQuestion: z.boolean(),
    })
    .strict()
    .array(),
});

export type CorrectionOutput = z.infer<typeof correctionOutputSchema>;
