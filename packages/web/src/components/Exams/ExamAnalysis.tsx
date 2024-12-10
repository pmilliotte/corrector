import { ReactElement } from 'react';

import {
  ExamAnalysis as ExamAnalysisType,
  ProblemAnalysis,
} from '@corrector/shared';

import { useUpdateExamQuestionsTools } from '~/lib';

import { Problem } from './Problem';

type ExamAnalysisProps = {
  examId: string;
  analysis: ExamAnalysisType;
};

export const ExamAnalysis = ({
  examId,
  analysis,
}: ExamAnalysisProps): ReactElement => {
  const updateExamQuestionsTools = useUpdateExamQuestionsTools({
    analysis,
    examId,
  });

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(analysis.problems as Record<string, ProblemAnalysis>).map(
        ([problemId, problem]) => (
          <Problem
            problem={problem}
            problemId={problemId}
            key={problemId}
            updateExamQuestionsTools={updateExamQuestionsTools}
          />
        ),
      )}
    </div>
  );
};
