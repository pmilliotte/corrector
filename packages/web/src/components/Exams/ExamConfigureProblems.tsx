import { MathJax } from 'better-react-mathjax';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import { Button, Separator } from '../ui';
import { DeleteStatementDialog } from './DeleteStatementDialog';
import { InsertStatementDialog } from './InsertStatementDialog';
import { ProblemContent, UpdateStatementDialog } from './UpdateStatementDialog';

type ExamConfigureProblemsProps = {
  examId: string;
  problems: { [key: string]: { content: ProblemContent[] } | undefined };
};

export const ExamConfigureProblems = ({
  examId,
  problems,
}: ExamConfigureProblemsProps): ReactElement => {
  const { mutate: updateExam, isPending: updateExamPending } =
    trpc.examGeneratePdf.useMutation();

  const StatementActions = ({
    statement,
    position,
    problemId,
  }: {
    statement: ProblemContent;
    position: number;
    problemId: string;
  }) => (
    <div className="flex items-center gap-1">
      <UpdateStatementDialog
        statement={statement}
        examId={examId}
        problemId={problemId}
      />
      <DeleteStatementDialog
        examId={examId}
        statementId={statement.id}
        problemId={problemId}
      />
      <InsertStatementDialog
        position={position}
        examId={examId}
        problemId={problemId}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      <Button
        className="self-end flex gap-2"
        onClick={() => updateExam({ id: examId })}
      >
        {updateExamPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
        <FormattedMessage id="exams.generatePdf" values={{ step: 2 }} />
      </Button>
      {Object.entries(problems).map(([problemId, problem], problemIndex) =>
        problem === undefined ? null : (
          <div key={problemId} className="flex flex-col border p-2 rounded-lg">
            <div className="flex flex-col font-semibold p-2 gap-2">
              <div className="flex items-center justify-between">
                <FormattedMessage
                  id="exams.problem.path"
                  values={{ path: problemIndex + 1 }}
                />
                <InsertStatementDialog
                  position={0}
                  examId={examId}
                  problemId={problemId}
                />
              </div>
              <Separator />
            </div>
            <div className="flex flex-col">
              {problem.content.map((statement, index) =>
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
                      problemId={problemId}
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
                      problemId={problemId}
                    />
                  </div>
                ),
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
};
