export const QUESTION_METHOD_STEP_ITEMS = ['mark', 'step', 'answer'] as const;

export type QuestionMethodStepItem =
  (typeof QUESTION_METHOD_STEP_ITEMS)[number];
