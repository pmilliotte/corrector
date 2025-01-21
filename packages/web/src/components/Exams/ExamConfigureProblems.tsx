import { MathJax } from 'better-react-mathjax';
import { ArrowRight, ExternalLink, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import { Badge, Button, Separator } from '../ui';
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
  const utils = trpc.useUtils();
  const { mutate: checkPdf, isPending: checkPdfPending } =
    trpc.examGeneratePdf.useMutation({
      onSuccess: async () => {
        const subjectUrl = await utils.examSubjectPresignedUrlGet.fetch({
          examId,
        });

        window.open(subjectUrl, '_blank', 'noopener,noreferrer');
      },
    });

  const { mutateAsync: setReady } = trpc.examSetReady.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
    },
  });
  const {
    mutate: generatePdfAndSetReady,
    isPending: generatePdfAndSetReadyPending,
  } = trpc.examGeneratePdf.useMutation({
    onSuccess: async () => {
      await setReady({ id: examId });
    },
  });

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
      {problems.map(({ id: problemId, content }, problemIndex) => (
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
            {content.map((statement, index) =>
              statement.type === 'statement' ? (
                <div
                  key={statement.id}
                  className="flex justify-between gap-2 hover:bg-muted rounded-lg p-2"
                >
                  <div className="min-h-[36px]">
                    <MathJax>{statement.text}</MathJax>
                  </div>
                  <div>
                    <StatementActions
                      statement={statement}
                      position={index + 1}
                      problemId={problemId}
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
                  <div className="flex items-center gap-2">
                    <Badge className="whitespace-nowrap" variant="secondary">
                      <FormattedMessage
                        id="exams.problem.statement.numberOfLines"
                        values={{ numberOfLines: statement.numberOfLines }}
                      />
                    </Badge>
                    <StatementActions
                      statement={statement}
                      position={index + 1}
                      problemId={problemId}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-2 self-end">
        <Button
          className="self-end flex gap-2"
          onClick={() => checkPdf({ id: examId })}
          variant="outline"
        >
          {checkPdfPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ExternalLink size={16} />
          )}
          <FormattedMessage id="exams.generatePdf" />
        </Button>
        <Button
          className="self-end flex gap-2"
          onClick={() => {
            generatePdfAndSetReady({ id: examId });
          }}
        >
          {generatePdfAndSetReadyPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ArrowRight size={16} />
          )}
          <FormattedMessage id="exams.setReady" />
        </Button>
      </div>
    </div>
  );
};
