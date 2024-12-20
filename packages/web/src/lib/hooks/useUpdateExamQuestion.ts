import set from 'lodash/set';
import { useCallback, useEffect, useState } from 'react';

import {
  ExamAnalysis,
  examAnalysisSchema,
  QuestionAnalysis,
  UpdateQuestionInput,
  UpdateQuestionMethodInput,
} from '@corrector/shared';

type DraftingPropertyInput = {
  questionId: string;
  problemId: string;
  propertyName: 'mark' | 'statement';
};
type DraftingMethodStepInput = {
  questionId: string;
  problemId: string;
  methodStepId: string;
  propertyName: 'methodStep';
};

export type UpdateExamQuestionTools = {
  getCurrentQuestion: ({
    problemId,
    questionId,
  }: {
    problemId: string;
    questionId: string;
  }) => QuestionAnalysis;
  examId: string;
  cancelDraft: () => void;
  isDraftingProperty: (input: DraftingPropertyInput) => boolean;
  isDraftingMethodStep: (input: DraftingMethodStepInput) => boolean;
  isDraftingOther: (
    input: DraftingPropertyInput | DraftingMethodStepInput,
  ) => boolean;
  isDrafting: () => boolean;
  setUpdatingMethodStep: React.Dispatch<
    React.SetStateAction<UpdateQuestionMethodInput | undefined>
  >;
  setUpdatingProperty: React.Dispatch<
    React.SetStateAction<UpdateQuestionInput | undefined>
  >;
};

export const useUpdateExamQuestionTools = ({
  analysis,
  examId,
}: {
  analysis: ExamAnalysis;
  examId: string;
}): UpdateExamQuestionTools => {
  const [updatingMethodStep, setUpdatingMethodStep] =
    useState<UpdateQuestionMethodInput>();
  const [updatingproperty, setUpdatingProperty] =
    useState<UpdateQuestionInput>();
  const [currentAnalysis, setCurrentAnalysis] =
    useState<ExamAnalysis>(analysis);

  useEffect(() => {
    updatingMethodStep !== undefined && setUpdatingProperty(undefined);
    updatingproperty !== undefined && setUpdatingMethodStep(undefined);

    const cloneAnalysis = examAnalysisSchema.parse(analysis);
    switch (true) {
      case updatingMethodStep !== undefined: {
        set(
          cloneAnalysis,
          `problems.${updatingMethodStep.problemId}.questions.${updatingMethodStep.questionId}.method`,
          cloneAnalysis.problems[updatingMethodStep.problemId]?.questions[
            updatingMethodStep.questionId
          ]?.method.map(method =>
            method.id === updatingMethodStep.value.id
              ? updatingMethodStep.value
              : method,
          ),
        );
        break;
      }
      case updatingproperty !== undefined: {
        set(
          cloneAnalysis,
          `problems.${updatingproperty.problemId}.questions.${updatingproperty.questionId}.${updatingproperty.propertyName}`,
          updatingproperty.value,
        );
        break;
      }
      default:
        break;
    }

    setCurrentAnalysis(cloneAnalysis);
  }, [updatingMethodStep, updatingproperty, analysis]);

  const getCurrentQuestion = useCallback(
    ({ problemId, questionId }: { problemId: string; questionId: string }) => {
      const question =
        currentAnalysis.problems[problemId]?.questions[questionId];
      if (question === undefined) {
        throw new Error();
      }

      return question;
    },
    [currentAnalysis],
  );

  const cancelDraft = () => {
    setUpdatingMethodStep(undefined);
    setUpdatingProperty(undefined);
  };

  const isDraftingProperty = ({
    problemId,
    questionId,
    propertyName,
  }: DraftingPropertyInput) =>
    updatingproperty !== undefined &&
    updatingproperty.questionId === questionId &&
    updatingproperty.problemId === problemId &&
    updatingproperty.propertyName === propertyName;

  const isDraftingMethodStep = ({
    problemId,
    questionId,
    methodStepId,
  }: DraftingMethodStepInput) =>
    updatingMethodStep !== undefined &&
    updatingMethodStep.questionId === questionId &&
    updatingMethodStep.problemId === problemId &&
    updatingMethodStep.value.id === methodStepId;

  const isDraftingOther = (
    input: DraftingPropertyInput | DraftingMethodStepInput,
  ) => {
    switch (input.propertyName) {
      case 'mark':
      case 'statement':
        return (
          updatingMethodStep !== undefined ||
          (updatingproperty !== undefined && !isDraftingProperty(input))
        );

      case 'methodStep':
        return (
          updatingproperty !== undefined ||
          (updatingMethodStep !== undefined && !isDraftingMethodStep(input))
        );
    }
  };

  const isDrafting = () =>
    updatingMethodStep !== undefined || updatingproperty !== undefined;

  return {
    getCurrentQuestion,
    isDrafting,
    examId,
    cancelDraft,
    isDraftingMethodStep,
    isDraftingProperty,
    isDraftingOther,
    setUpdatingMethodStep,
    setUpdatingProperty,
  };
};
