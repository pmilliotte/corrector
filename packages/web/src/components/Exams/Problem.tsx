import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ProblemAnalysis, QuestionAnalysis } from '@corrector/shared';

import { UpdateExamQuestionsTools } from '~/lib';

import { Question } from './Question';

type ProblemProps = {
  problem: ProblemAnalysis;
  problemId: string;
  updateExamQuestionsTools: UpdateExamQuestionsTools;
};

export const Problem = ({
  problemId,
  problem,
  updateExamQuestionsTools,
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
        ([questionId, question]) => (
          <Question
            key={questionId}
            question={question}
            questionId={questionId}
            problemId={problemId}
            updateExamQuestionsTools={updateExamQuestionsTools}
          />
        ),
      )}
    </div>
  );
};
