import { Ban, Check, Eye, Loader2, SquarePen } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc, useUserOrganizations } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Button, Input } from '../../ui';

type QuestionTitleProps = {
  questionId: string;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const QuestionTitle = ({
  updateExamQuestionTools,
  questionId,
  problemId,
}: QuestionTitleProps): ReactElement => {
  const [updating, setUpdating] = useState(false);
  const { selectedOrganization } = useUserOrganizations();
  const {
    getCurrentQuestion,
    setUpdatingProperty,
    cancelDraft,
    isDraftingOther,
    isDraftingProperty,
    examId,
  } = updateExamQuestionTools;
  const question = getCurrentQuestion({ problemId, questionId });
  const [newMark, setNewMark] = useState<number>(question.mark);
  const utils = trpc.useUtils();
  const { mutate: updateQuestion, isPending: updateQuestionPending } =
    trpc.examSubjectAnalysisQuestionUpdate.useMutation({
      onSuccess: async () => {
        await utils.examSubjectAnalysisGet.invalidate();
      },
    });

  if (updating) {
    return (
      <>
        <div className="grow flex items-center justify-between gap-2">
          <span className="whitespace-nowrap">
            <FormattedMessage
              id="exams.problem.question.title"
              values={{ path: question.path }}
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
            <FormattedMessage id="exams.problem.question.points" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-primary">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              newMark === question.mark
                ? cancelDraft()
                : setUpdatingProperty({
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
            size="icon"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              cancelDraft();
              setNewMark(question.mark);
              setUpdating(false);
            }}
          >
            <Ban size={16} />
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="grow flex items-center justify-between">
        <div>
          <FormattedMessage
            id="exams.problem.question.title"
            values={{ path: question.path }}
          />
        </div>
        <FormattedMessage
          id="exams.problem.question.marks"
          values={{ mark: newMark }}
        />
      </div>
      <div className="flex items-center gap-1 text-primary">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setUpdatingProperty({
              questionId,
              problemId,
              propertyName: 'mark',
              value: newMark,
            });
            setUpdating(true);
          }}
          disabled={
            isDraftingOther({
              problemId,
              questionId,
              propertyName: 'mark',
            }) || updateQuestionPending
          }
        >
          <SquarePen size={16} />
        </Button>
        <Button
          onClick={() =>
            updateQuestion({
              questionId,
              problemId,
              propertyName: 'mark',
              value: newMark,
              organizationId: selectedOrganization.id,
              examId,
            })
          }
          disabled={
            !isDraftingProperty({ problemId, questionId, propertyName: 'mark' })
          }
          size="icon"
        >
          {updateQuestionPending ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Check size={16} />
          )}
        </Button>
      </div>
    </>
  );
};
