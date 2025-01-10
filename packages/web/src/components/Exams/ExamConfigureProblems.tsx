import { MathJax } from 'better-react-mathjax';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Separator } from '../ui';
import { ProblemContent, UpdateStatementDialog } from './UpdateStatementDialog';

type ExamConfigureProblemsProps = {
  examId: string;
  problems: { content: ProblemContent[]; id: string }[];
};

export const ExamConfigureProblems = ({
  examId,
  problems,
}: ExamConfigureProblemsProps): ReactElement => (
  <div className="flex flex-col gap-2 h-full">
    {problems.map(({ content, id: problemId }, problemIndex) => (
      <div key={problemId} className="flex flex-col border p-2 rounded-lg">
        <div className="flex flex-col font-semibold p-2 gap-2">
          <FormattedMessage
            id="exams.problem.path"
            values={{ path: problemIndex + 1 }}
          />
          <Separator />
        </div>
        <div className="flex flex-col">
          {content.map(statement =>
            statement.type === 'statement' ? (
              <div
                key={statement.id}
                className="flex justify-between gap-2 hover:bg-muted rounded-lg p-2"
              >
                <div className="min-h-[36px]">
                  <MathJax>{statement.text}</MathJax>
                </div>
                <div>
                  <UpdateStatementDialog
                    statement={statement}
                    examId={examId}
                  />
                </div>
              </div>
            ) : (
              <div
                key={statement.id}
                className="flex justify-between gap-2 hover:bg-muted rounded-lg p-2"
              >
                <div className="flex flex-col gap-1 min-h-[36px]">
                  <span className="underline text-sm text-muted-foreground">
                    <FormattedMessage
                      id="exams.problem.question.title"
                      values={{ path: statement.index }}
                    />
                  </span>
                  <MathJax>{statement.text}</MathJax>
                </div>
                <div>
                  <UpdateStatementDialog
                    statement={statement}
                    examId={examId}
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </div>
    ))}
  </div>
);
