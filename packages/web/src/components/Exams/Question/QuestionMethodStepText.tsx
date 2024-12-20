import { MathJax } from 'better-react-mathjax';
import { Eye, SquarePen } from 'lucide-react';
import { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Method } from '@corrector/shared';

import { QuestionMethodStepItem } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Button, Textarea } from '../../ui';

type QuestionMethodStepTextProps = {
  propertyName: Exclude<QuestionMethodStepItem, 'mark'>;
  updating?: QuestionMethodStepItem;
  setUpdating: Dispatch<SetStateAction<QuestionMethodStepItem | undefined>>;
  updateExamQuestionTools: UpdateExamQuestionTools;
  problemId: string;
  questionId: string;
  methodStep: Method;
};

export const QuestionMethodStepText = ({
  propertyName,
  updating,
  setUpdating,
  updateExamQuestionTools,
  problemId,
  questionId,
  methodStep,
}: QuestionMethodStepTextProps): ReactElement => {
  const [newText, setNewText] = useState<string>(methodStep[propertyName]);
  const { setUpdatingMethodStep } = updateExamQuestionTools;

  return (
    <>
      <div className="text-sm font-semibold">
        <FormattedMessage
          id={`exams.problem.question.methodStep.title.${propertyName}`}
        />
      </div>
      <div className="flex items-center justify-between gap-2">
        {updating === propertyName ? (
          <Textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
          />
        ) : (
          <MathJax dynamic className="grow whitespace-pre-wrap">
            {newText}
          </MathJax>
        )}
        <div className="flex items-center gap-1 text-primary">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setUpdatingMethodStep(prevMethodStep => ({
                problemId,
                questionId,
                value: {
                  ...(prevMethodStep?.value ?? methodStep),
                  [propertyName]: newText,
                },
              }));
              setUpdating(updating === propertyName ? undefined : propertyName);
            }}
            disabled={updating !== undefined && updating !== propertyName}
          >
            {updating === propertyName ? (
              <Eye size={16} />
            ) : (
              <SquarePen size={16} />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
