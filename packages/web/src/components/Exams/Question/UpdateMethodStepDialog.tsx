import { Check, Loader2, SquarePen } from 'lucide-react';
import { Fragment, ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Method } from '@corrector/shared';

import { QuestionMethodStepItem, trpc, useUserOrganizations } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
  Separator,
} from '../../ui';
import { QuestionMethodStepMark } from './QuestionMethodStepMark';
import { QuestionMethodStepText } from './QuestionMethodStepText';

type UpdateMethodStepDialogProps = {
  methodStep: Method;
  questionId: string;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const UpdateMethodStepDialog = ({
  questionId,
  problemId,
  methodStep,
  updateExamQuestionTools,
}: UpdateMethodStepDialogProps): ReactElement => {
  const [updating, setUpdating] = useState<QuestionMethodStepItem>();
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useUserOrganizations();
  const { cancelDraft, isDraftingOther, isDraftingMethodStep, examId } =
    updateExamQuestionTools;
  const utils = trpc.useUtils();
  const { mutate: updateMethodStep, isPending: updateMethodStepPending } =
    trpc.examSubjectAnalysisQuestionMethodUpdate.useMutation({
      onSuccess: async () => {
        await utils.examSubjectAnalysisGet.invalidate();
        onOpenChange(false);
      },
    });

  const onOpenChange = (dialogOpen: boolean) => {
    if (!dialogOpen) {
      setUpdating(undefined);
      cancelDraft();
    }
    setOpen(dialogOpen);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          disabled={
            isDraftingOther({
              problemId,
              questionId,
              methodStepId: methodStep.id,
              propertyName: 'methodStep',
            }) || updateMethodStepPending
          }
        >
          <SquarePen size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <div className="flex flex-col gap-2">
          <QuestionMethodStepMark
            updateExamQuestionTools={updateExamQuestionTools}
            updating={updating}
            setUpdating={setUpdating}
            problemId={problemId}
            questionId={questionId}
            methodStep={methodStep}
          />
          <Separator />
          {['step', 'answer'].map(propertyName => (
            <Fragment key={propertyName}>
              <QuestionMethodStepText
                propertyName={
                  propertyName as Exclude<QuestionMethodStepItem, 'mark'>
                }
                updateExamQuestionTools={updateExamQuestionTools}
                updating={updating}
                setUpdating={setUpdating}
                problemId={problemId}
                questionId={questionId}
                methodStep={methodStep}
              />
              <Separator />
            </Fragment>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            <FormattedMessage id="common.cancel" />
          </Button>
          <Button
            className="gap-2"
            onClick={() =>
              updateMethodStep({
                organizationId: selectedOrganization.id,
                examId,
                questionId,
                problemId,
                value: methodStep,
              })
            }
            disabled={
              updating !== undefined ||
              updateMethodStepPending ||
              !isDraftingMethodStep({
                problemId,
                questionId,
                methodStepId: methodStep.id,
                propertyName: 'methodStep',
              })
            }
          >
            {updateMethodStepPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Check size={16} />
            )}
            <FormattedMessage id="common.validateUpdates" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
