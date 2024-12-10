import { useState } from 'react';

import {
  ExamAnalysis,
  QuestionAnalysis,
  UpdateQuestionInput,
} from '@corrector/shared';

import { useUserOrganizations } from '../contexts';
import { trpc } from '../utils';

export type UpdateExamQuestionsTools = {
  examAnalysis: ExamAnalysis & { updatingQuestion?: UpdateQuestionInput };
  updateQuestion: (input: UpdateQuestionInput) => void;
  getQuestion: (questionId: {
    questionId: string;
    problemId: string;
  }) => QuestionAnalysis;
  cancelUpdate: () => void;
  validateUpdate: () => void;
  isDrafting: (input: Omit<UpdateQuestionInput, 'value'>) => boolean;
  isLoading: (input: Omit<UpdateQuestionInput, 'value'>) => boolean;
};

export const useUpdateExamQuestionsTools = ({
  analysis,
  examId,
}: {
  analysis: ExamAnalysis;
  examId: string;
}): UpdateExamQuestionsTools => {
  const [examAnalysis, setExamAnalysis] = useState<
    ExamAnalysis & { updatingQuestion?: UpdateQuestionInput }
  >(analysis);
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const {
    mutate,
    isPending,
    variables: updateVariables,
  } = trpc.examSubjectAnalysisUpdate.useMutation({
    onSuccess: async data => {
      await utils.examSubjectAnalysisGet.invalidate();
      setExamAnalysis(data);
    },
  });
  const updateQuestion = (input: UpdateQuestionInput) =>
    setExamAnalysis(prevAnalysis => ({
      ...prevAnalysis,
      updatingQuestion: input,
    }));

  const getQuestion = ({
    questionId,
    problemId,
  }: {
    questionId: string;
    problemId: string;
  }) => {
    const currentQuestion =
      examAnalysis.problems[problemId]?.questions[questionId];
    if (currentQuestion === undefined) {
      throw new Error();
    }
    if (examAnalysis.updatingQuestion === undefined) {
      return currentQuestion;
    }
    const {
      problemId: updatingQuestionProblemId,
      questionId: updatingQuestionQuestionId,
      propertyName,
      value,
    } = examAnalysis.updatingQuestion;

    if (
      updatingQuestionProblemId !== problemId ||
      updatingQuestionQuestionId !== questionId
    ) {
      return currentQuestion;
    }

    return { ...currentQuestion, [propertyName]: value };
  };

  const cancelUpdate = () =>
    setExamAnalysis(prevAnalysis => {
      const { updatingQuestion, ...restOfAnalysis } = prevAnalysis;

      return restOfAnalysis;
    });

  const validateUpdate = () => {
    if (examAnalysis.updatingQuestion === undefined) {
      throw new Error('No question to validate');
    }

    mutate({
      organizationId: selectedOrganization.id,
      examId,
      ...examAnalysis.updatingQuestion,
    });
  };

  const isDrafting = ({
    problemId,
    questionId,
    propertyName,
  }: Omit<UpdateQuestionInput, 'value'>) =>
    examAnalysis.updatingQuestion?.problemId === problemId &&
    examAnalysis.updatingQuestion.questionId === questionId &&
    examAnalysis.updatingQuestion.propertyName === propertyName;

  const isLoading = ({
    problemId,
    questionId,
    propertyName,
  }: Omit<UpdateQuestionInput, 'value'>) =>
    isPending &&
    updateVariables.problemId === problemId &&
    updateVariables.questionId === questionId &&
    updateVariables.propertyName === propertyName;

  return {
    examAnalysis,
    updateQuestion,
    getQuestion,
    cancelUpdate,
    validateUpdate,
    isLoading,
    isDrafting,
  };
};
