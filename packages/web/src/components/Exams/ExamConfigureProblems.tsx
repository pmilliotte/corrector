import { MathJax } from 'better-react-mathjax';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Separator } from '../ui';
import { DeleteStatementDialog } from './DeleteStatementDialog';
import { InsertStatementDialog } from './InsertStatementDialog';
import { ProblemContent, UpdateStatementDialog } from './UpdateStatementDialog';

type ExamConfigureProblemsProps = {
  examId: string;
  problems: { content: ProblemContent[]; id: string }[];
};

export const ExamConfigureProblems = ({
  examId,
  problems,
}: ExamConfigureProblemsProps): ReactElement => {
  const StatementActions = ({
    statement,
    position,
  }: {
    statement: ProblemContent;
    position: number;
  }) => (
    <div className="flex items-center gap-1">
      <UpdateStatementDialog statement={statement} examId={examId} />
      <DeleteStatementDialog statementId={statement.id} examId={examId} />
      <InsertStatementDialog position={position} examId={examId} />
    </div>
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      {problems.map(({ content, id: problemId }, problemIndex) => (
        <div key={problemId} className="flex flex-col border p-2 rounded-lg">
          <div className="flex flex-col font-semibold p-2 gap-2">
            <div className="flex items-center justify-between">
              <FormattedMessage
                id="exams.problem.path"
                values={{ path: problemIndex + 1 }}
              />
              <InsertStatementDialog position={0} examId={examId} />
            </div>
            <Separator />
          </div>
          <div className="flex flex-col">
            {content.map((statement, index) =>
              statement.type === 'statement' ? (
                <div
                  key={statement.id}
                  className="flex justify-between gap-2 hover:bg-muted rounded-lg p-2"
                >
                  <div className="min-h-[36px]">
                    <MathJax>{statement.text}</MathJax>
                  </div>
                  <StatementActions
                    statement={statement}
                    position={index + 1}
                  />
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
                  <StatementActions
                    statement={statement}
                    position={index + 1}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
