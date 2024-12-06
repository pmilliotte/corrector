import { Fragment, ReactElement } from 'react';

import { ExamOutput } from '@corrector/shared';

import { Separator } from '../ui';
import { Problem } from './Problem';

type ExamAnalysisProps = {
  examId: string;
  analysis: ExamOutput;
};

export const ExamAnalysis = ({
  examId,
  analysis,
}: ExamAnalysisProps): ReactElement => {
  console.log(examId);

  return (
    <div className="flex flex-col gap-2">
      {analysis.problems.map(problem => (
        <Fragment key={problem.problemPath}>
          <Problem problem={problem} />
          <Separator />
        </Fragment>
      ))}
    </div>
  );
};
