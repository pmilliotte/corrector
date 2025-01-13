import { Trash2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

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
  statementId: string;
  examId: string;
};

export const DeleteStatementDialog = ({
  statementId,
  examId,
}: DeleteStatementDialogProps): ReactElement => {
  console.log(statementId, examId);

  return (
    <AlertDialog>
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
            onClick={() => console.log('continue')}
            className="flex items-center gap-2"
          >
            <Trash2 size={16} />
            <FormattedMessage id="common.delete" />
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
