import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ProblemAnalysis, QuestionAnalysis } from '@corrector/shared';

import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Question } from './Question';

type ProblemProps = {
  problem: ProblemAnalysis;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const Problem = ({
  problemId,
  problem,
  updateExamQuestionTools,
}: ProblemProps): ReactElement => {
  const { problemPath, problemTitle, questions } = problem;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-bold text-muted-foreground">
        <FormattedMessage
          id="exams.problem.title"
          values={{ title: problemTitle, path: problemPath }}
        />
      </div>
      {Object.entries(questions as Record<string, QuestionAnalysis>).map(
        ([questionId]) => (
          <Question
            key={questionId}
            questionId={questionId}
            problemId={problemId}
            updateExamQuestionTools={updateExamQuestionTools}
          />
        ),
      )}
    </div>
  );
};
