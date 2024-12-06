import { Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { FileType } from '@corrector/shared';

import { trpc, useUserOrganizations } from '~/lib';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui';

type DeleteFileDialogProps = { fileType: FileType; examId: string };

export const DeleteFileDialog = ({
  fileType,
  examId,
}: DeleteFileDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.examFileDelete.useMutation({
    onSuccess: async () => {
      await utils.examFileGet.invalidate();
      setOpen(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" className="text-destructive">
          <Trash2 size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id={`exams.files.${fileType}`} />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="exams.files.confirmDeletion" />
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="destructive"
            className="gap-2"
            onClick={() =>
              mutate({
                fileType,
                organizationId: selectedOrganization.id,
                examId,
              })
            }
          >
            {isPending ? (
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
