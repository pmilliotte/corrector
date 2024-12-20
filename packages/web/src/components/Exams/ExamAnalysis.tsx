import { ReactElement } from 'react';

import {
  ExamAnalysis as ExamAnalysisType,
  ProblemAnalysis,
} from '@corrector/shared';

import { useUpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Problem } from './Problem';

type ExamAnalysisProps = {
  examId: string;
  analysis: ExamAnalysisType;
};

export const ExamAnalysis = ({
  examId,
  analysis,
}: ExamAnalysisProps): ReactElement => {
  const updateExamQuestionTools = useUpdateExamQuestionTools({
    analysis,
    examId,
  });

  return (
    <div className="flex flex-col gap-8">
      {Object.entries(analysis.problems as Record<string, ProblemAnalysis>).map(
        ([problemId, problem]) => (
          <Problem
            problem={problem}
            problemId={problemId}
            key={problemId}
            updateExamQuestionTools={updateExamQuestionTools}
          />
        ),
      )}
    </div>
  );
};
