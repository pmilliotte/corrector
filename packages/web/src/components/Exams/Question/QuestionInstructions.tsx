import { MathJax } from 'better-react-mathjax';
import { Ban, Check, Eye, Loader2, SquarePen } from 'lucide-react';
import { ReactElement, useState } from 'react';

import { trpc, useUserOrganizations } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import { Button, Textarea } from '../../ui';

type QuestionInstructionsProps = {
  questionId: string;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const QuestionInstructions = ({
  updateExamQuestionTools,
  questionId,
  problemId,
}: QuestionInstructionsProps): ReactElement => {
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
  const [newText, setNewText] = useState<string>(question.instructions ?? '');
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
        <Textarea value={newText} onChange={e => setNewText(e.target.value)} />
        <div className="flex items-center gap-1 text-primary">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setUpdating(false);
              newText === question.instructions
                ? cancelDraft()
                : setUpdatingProperty({
                    questionId,
                    problemId,
                    propertyName: 'instructions',
                    value: newText,
                  });
            }}
          >
            <Eye size={16} />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="text-destructive hover:text-destructive"
            onClick={() => {
              setUpdating(false);
              cancelDraft();
              setNewText(question.instructions ?? '');
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
      <MathJax dynamic className="grow whitespace-pre-wrap">
        {newText}
      </MathJax>
      <div className="flex items-center gap-1 text-primary">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setUpdatingProperty({
              questionId,
              problemId,
              propertyName: 'instructions',
              value: newText,
            });
            setUpdating(true);
          }}
          disabled={
            isDraftingOther({
              problemId,
              questionId,
              propertyName: 'instructions',
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
              propertyName: 'instructions',
              value: newText,
              organizationId: selectedOrganization.id,
              examId,
            })
          }
          disabled={
            !isDraftingProperty({
              problemId,
              questionId,
              propertyName: 'instructions',
            })
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
