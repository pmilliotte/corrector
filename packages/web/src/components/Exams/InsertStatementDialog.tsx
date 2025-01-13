import { BetweenHorizonalEnd, Save } from 'lucide-react';
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

type InsertStatementDialogProps = {
  position: number;
  examId: string;
};

export const InsertStatementDialog = ({
  position,
  examId,
}: InsertStatementDialogProps): ReactElement => {
  const [text, setText] = useState<string>('');

  console.log(position, examId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <BetweenHorizonalEnd size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id="exams.problem.statement.add.title" />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="exams.problem.statement.add.description" />
          </DialogDescription>
        </DialogHeader>
        <Textarea value={text} onChange={e => setText(e.target.value)} />
        <DialogFooter>
          <Button>
            <Save size={16} />
            <FormattedMessage id="common.save" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
