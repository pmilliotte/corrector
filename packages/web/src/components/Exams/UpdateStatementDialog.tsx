import { Pencil } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from '../ui';

export type ProblemContent =
  | { type: 'statement'; text: string; id: string }
  | { type: 'question'; text: string; index: number; id: string };

type UpdateStatementDialogProps = {
  statement: ProblemContent;
  examId: string;
};

export const UpdateStatementDialog = ({
  statement,
  // examId,
}: UpdateStatementDialogProps): ReactElement => {
  const [text, setText] = useState<string>(statement.text);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="exams.problem.statement.modify.title" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="exams.problem.statement.modify.description" />
          </DialogDescription>
        </DialogHeader>
        <Textarea value={text} onChange={e => setText(e.target.value)} />
        <DialogFooter>
          <Button>
            <FormattedMessage id="common.save" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
