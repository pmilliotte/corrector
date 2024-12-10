import { Ban, Check, Eye, Loader2, SquarePen } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { UpdateExamQuestionsTools } from '~/lib';

import { Button, Input } from '../../ui';

type QuestionTitleProps = {
  questionId: string;
  problemId: string;
  questionPath: string;
  mark?: number;
  updateExamQuestionsTools: UpdateExamQuestionsTools;
};

export const QuestionTitle = ({
  questionPath,
  mark = 0,
  updateExamQuestionsTools,
  questionId,
  problemId,
}: QuestionTitleProps): ReactElement => {
  const [updating, setUpdating] = useState(false);
  const [newMark, setNewMark] = useState<number | undefined>(mark);
  const {
    updateQuestion,
    cancelUpdate,
    getQuestion,
    isLoading,
    isDrafting,
    examAnalysis,
    validateUpdate,
  } = updateExamQuestionsTools;

  if (updating) {
    return (
      <>
        <div className="grow flex items-center justify-between gap-2">
          <span className="whitespace-nowrap">
            <FormattedMessage
              id="exams.problem.question.title"
              values={{ path: questionPath }}
            />
          </span>
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
            <FormattedMessage
              id="exams.problem.question.points"
              values={{ path: questionPath }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Button
            variant="outline"
            onClick={() => {
              newMark !== undefined &&
                newMark !== mark &&
                updateQuestion({
                  questionId,
                  problemId,
                  propertyName: 'mark',
                  value: newMark,
                });
              setUpdating(false);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              cancelUpdate();
              setNewMark(mark);
              setUpdating(false);
            }}
          >
            <Ban size={16} />
          </Button>
        </div>
      </>
    );
  }

  const question = getQuestion({ questionId, problemId });
  const isPropertyDrafting = isDrafting({
    problemId,
    questionId,
    propertyName: 'mark',
  });
  const isPropertyLoading = isLoading({
    problemId,
    questionId,
    propertyName: 'mark',
  });

  return (
    <>
      <div className="grow flex items-center justify-between">
        <div>
          <FormattedMessage
            id="exams.problem.question.title"
            values={{ path: questionPath }}
          />
        </div>
        <FormattedMessage
          id="exams.problem.question.marks"
          values={{ mark: question.mark ?? 0 }}
        />
      </div>
      <div className="flex items-center gap-1 text-primary">
        <Button
          variant="outline"
          onClick={() => setUpdating(true)}
          disabled={
            (examAnalysis.updatingQuestion !== undefined &&
              !isPropertyDrafting) ||
            isPropertyLoading
          }
        >
          <SquarePen size={16} />
        </Button>
        <Button onClick={validateUpdate} disabled={!isPropertyDrafting}>
          {isPropertyLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </Button>
      </div>
    </>
  );
};
