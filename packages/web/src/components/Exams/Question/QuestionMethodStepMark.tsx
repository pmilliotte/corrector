import { Eye, SquarePen } from 'lucide-react';
import { Dispatch, ReactElement, SetStateAction, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Method } from '@corrector/shared';

import { QuestionMethodStepItem } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Button, Input } from '../../ui';

type QuestionMethodMarkProps = {
  updating?: QuestionMethodStepItem;
  setUpdating: Dispatch<SetStateAction<QuestionMethodStepItem | undefined>>;
  updateExamQuestionTools: UpdateExamQuestionTools;
  problemId: string;
  questionId: string;
  methodStep: Method;
};

export const QuestionMethodStepMark = ({
  updating,
  setUpdating,
  updateExamQuestionTools,
  problemId,
  questionId,
  methodStep,
}: QuestionMethodMarkProps): ReactElement => {
  const [newMark, setNewMark] = useState<number>(methodStep.mark);
  const { setUpdatingMethodStep } = updateExamQuestionTools;

  return (
    <>
      <div className="text-sm font-semibold">
        <FormattedMessage id="exams.problem.question.methodStep.title.mark" />
      </div>
      <div className="flex items-center justify-between gap-2">
        {updating === 'mark' ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={99}
              step={0.5}
              className="w-auto"
              value={newMark}
              onChange={e => setNewMark(Number(e.target.value))}
            />
            <FormattedMessage id="exams.problem.question.points" />
          </div>
        ) : (
          <FormattedMessage
            id="exams.problem.question.marks"
            values={{ mark: newMark }}
          />
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
                  mark: newMark,
                },
              }));
              setUpdating(updating === 'mark' ? undefined : 'mark');
            }}
            disabled={updating !== undefined && updating !== 'mark'}
          >
            {updating === 'mark' ? <Eye size={16} /> : <SquarePen size={16} />}
          </Button>
        </div>
      </div>
    </>
  );
};
