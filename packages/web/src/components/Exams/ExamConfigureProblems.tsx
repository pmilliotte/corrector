import { ReactElement } from 'react';

import { Exam } from '@corrector/functions';

type ExamConfigureProblemsProps = {
  examId: string;
  problems: Exam['problems'];
};

export const ExamConfigureProblems = ({
  examId,
  problems,
}: ExamConfigureProblemsProps): ReactElement => {
  console.log(examId);

  return (
    <div className="flex flex-col gap-2 h-full">{JSON.stringify(problems)}</div>
  );
};
