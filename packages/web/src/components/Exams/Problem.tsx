import { MathJax } from 'better-react-mathjax';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Problem as ProblemType } from '@corrector/shared';

type ProblemProps = {
  problem: ProblemType;
};

export const Problem = ({ problem }: ProblemProps): ReactElement => {
  const { problemPath, problemTitle, questions } = problem;

  return (
    <div className="flex flex-col gap-1">
      <div className="font-bold">
        <FormattedMessage
          id="exams.problem.title"
          values={{ title: problemTitle, path: problemPath }}
        />
      </div>
      {questions.map(({ questionPath, questionStatement, answer }) => (
        <>
          <div className="font-semibold text-muted-foreground">
            <FormattedMessage
              id="exams.problem.question.title"
              values={{ path: questionPath }}
            />
          </div>
          <MathJax dynamic>{questionStatement}</MathJax>
          <div className="border border-solid border-primary p-2">
            <MathJax dynamic>{answer}</MathJax>
          </div>
        </>
      ))}
    </div>
  );
};
