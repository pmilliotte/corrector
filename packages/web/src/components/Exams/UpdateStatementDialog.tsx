import { Loader2, Pencil, Save } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

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
  | { type: 'question'; text: string; id: string; index: number };

type UpdateStatementDialogProps = {
  statement: ProblemContent;
  examId: string;
  problemId: string;
};

export const UpdateStatementDialog = ({
  statement,
  examId,
  problemId,
}: UpdateStatementDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState<string>(statement.text);
  const utils = trpc.useUtils();
  const { mutate, isPending } = trpc.examStatementUpdate.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button
            className="flex items-center gap-2"
            onClick={() =>
              mutate({ examId, problemId, statementId: statement.id, text })
            }
          >
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            <FormattedMessage id="common.save" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
