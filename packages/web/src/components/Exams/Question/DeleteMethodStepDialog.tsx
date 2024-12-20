import { Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { Method } from '@corrector/shared';

import { trpc, useUserOrganizations } from '~/lib';
import { UpdateExamQuestionTools } from '~/lib/hooks/useUpdateExamQuestion';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui';

type DeleteMethodStepDialogProps = {
  methodStep: Method;
  questionId: string;
  problemId: string;
  updateExamQuestionTools: UpdateExamQuestionTools;
};

export const DeleteMethodStepDialog = ({
  questionId,
  problemId,
  methodStep,
  updateExamQuestionTools,
}: DeleteMethodStepDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useUserOrganizations();
  const { cancelDraft, isDraftingOther, examId } = updateExamQuestionTools;
  const utils = trpc.useUtils();
  const { mutate: deleteMethodStep, isPending: deleteMethodStepPending } =
    trpc.examSubjectAnalysisQuestionMethodDelete.useMutation({
      onSuccess: async () => {
        await utils.examSubjectAnalysisGet.invalidate();
      },
    });

  const onOpenChange = (dialogOpen: boolean) => {
    if (!dialogOpen) {
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
          className="text-destructive hover:text-destructive"
          disabled={
            isDraftingOther({
              problemId,
              questionId,
              propertyName: 'methodStep',
              methodStepId: methodStep.id,
            }) || deleteMethodStepPending
          }
        >
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="exams.problem.question.methodStep.method" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="exams.problem.question.methodStep.delete" />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() =>
              deleteMethodStep({
                organizationId: selectedOrganization.id,
                examId,
                questionId,
                problemId,
                methodStepId: methodStep.id,
              })
            }
          >
            {deleteMethodStepPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            <FormattedMessage id="common.delete" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
