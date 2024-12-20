import { MathJax } from 'better-react-mathjax';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Method } from '@corrector/shared';

import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { DeleteMethodStepDialog } from './DeleteMethodStepDialog';
import { UpdateMethodStepDialog } from './UpdateMethodStepDialog';

type QuestionTitleProps = {
  questionId: string;
  problemId: string;
  methodStep: Method;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const QuestionMethodStep = ({
  methodStep,
  updateExamQuestionTools,
  questionId,
  problemId,
}: QuestionTitleProps): ReactElement => (
  <div className="flex items-start justify-between">
    <div className="grow flex flex-col text-sm">
      {methodStep.step === '' ? (
        <span className="italic text-muted-foreground">
          <FormattedMessage id="exams.problem.question.methodStep.emptyStep" />
        </span>
      ) : (
        <MathJax dynamic className="whitespace-pre-wrap">
          {methodStep.step}
        </MathJax>
      )}
      {methodStep.answer === '' ? (
        <span className="italic text-muted-foreground">
          <FormattedMessage id="exams.problem.question.methodStep.emptyAnswer" />
        </span>
      ) : (
        <MathJax dynamic className="whitespace-pre-wrap text-muted-foreground">
          {methodStep.answer}
        </MathJax>
      )}
    </div>
    <div className="flex items-center gap-2 text-primary">
      <div className="whitespace-nowrap">
        <FormattedMessage
          id="exams.problem.question.marks"
          values={{ mark: methodStep.mark }}
        />
      </div>
      <div className="flex items-center gap-1">
        <UpdateMethodStepDialog
          questionId={questionId}
          problemId={problemId}
          methodStep={methodStep}
          updateExamQuestionTools={updateExamQuestionTools}
        />
        <DeleteMethodStepDialog
          questionId={questionId}
          problemId={problemId}
          methodStep={methodStep}
          updateExamQuestionTools={updateExamQuestionTools}
        />
      </div>
    </div>
  </div>
);
