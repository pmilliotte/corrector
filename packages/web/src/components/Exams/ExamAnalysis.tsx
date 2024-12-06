import { ReactElement } from 'react';

import { ExamOutput } from '@corrector/shared';

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
    <div>
      {analysis.problems.map(({ problemTitle, problemPath }) => (
        <div key={problemPath}>{problemTitle}</div>
      ))}
    </div>
  );
};
