import { Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '../ui';

export type ProblemContent =
  | { type: 'statement'; text: string; id: string }
  | { type: 'question'; text: string; index: number; id: string };

type DeleteStatementDialogProps = {
  examId: string;
  statementId: string;
  problemId: string;
};

export const DeleteStatementDialog = ({
  examId,
  statementId,
  problemId,
}: DeleteStatementDialogProps): ReactElement => {
  const utils = trpc.useUtils();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = trpc.examStatementDelete.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
      setOpen(false);
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Trash2 size={16} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            <FormattedMessage id="exams.problem.statement.delete.title" />
          </AlertDialogTitle>
          <AlertDialogDescription>
            <FormattedMessage id="exams.problem.statement.delete.description" />
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => console.log('cancel')}>
            <FormattedMessage id="common.cancel" />
          </AlertDialogCancel>
          <Button
            onClick={() => mutate({ examId, problemId, statementId })}
            className="flex items-center gap-2"
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Trash2 size={16} />
            )}
            <FormattedMessage id="common.delete" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
