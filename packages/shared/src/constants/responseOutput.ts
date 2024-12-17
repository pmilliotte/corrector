import { z } from 'zod';

type ResponseOutputStructureDescription = {
  questionId: string;
  answer: string;
  answers: string;
  name: string;
  mark: string;
  correction: string;
};

export const getResponseOutputSchema = ({
  questionId,
  answer,
  answers,
  name,
  mark,
  correction,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
}: Partial<ResponseOutputStructureDescription>) =>
  z
    .object({
      name: z
        .string()
        .optional()
        .describe(name ?? ''),
      answers: z.array(
        z
          .object({
            id: z.string().describe(questionId ?? ''),
            answer: z.string().describe(answer ?? ''),
            mark: z
              .number()
              .min(0)
              .describe(mark ?? ''),
            correction: z.string().describe(correction ?? ''),
          })
          .describe(answers ?? ''),
      ),
    })
    .strict();

export type ResponseOutput = z.infer<
  ReturnType<typeof getResponseOutputSchema>
>;
