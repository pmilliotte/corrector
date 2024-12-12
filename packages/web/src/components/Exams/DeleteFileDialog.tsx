import { Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_BLANK, EXAM_RESPONSE, FileType } from '@corrector/shared';

import { SelectedFile, trpc, useUserOrganizations } from '~/lib';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui';

type DeleteFileDialogProps = {
  fileType: FileType;
  examId: string;
  fileId: string;
  setSelectedFile?: (value: SelectedFile) => void;
};

export const DeleteFileDialog = ({
  fileType,
  fileId,
  examId,
  setSelectedFile,
}: DeleteFileDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate: deleteExamBlank, isPending: deleteExamBlankPending } =
    trpc.examSubjectDelete.useMutation({
      onSuccess: async () => {
        await utils.examGet.invalidate();
        setSelectedFile?.({ id: 'subject', status: 'toBeUploaded' });
        setOpen(false);
      },
    });
  const { mutate: deleteResponse, isPending: deleteResponsePending } =
    trpc.responseDelete.useMutation({
      onSuccess: async () => {
        await utils.responseList.invalidate();
        setSelectedFile?.({ id: 'subject', status: 'toBeUploaded' });
        setOpen(false);
      },
    });

  const onClick = () => {
    switch (fileType) {
      case EXAM_BLANK:
        deleteExamBlank({
          organizationId: selectedOrganization.id,
          examId,
        });
        break;
      case EXAM_RESPONSE:
        deleteResponse({
          organizationId: selectedOrganization.id,
          examId,
          responseId: fileId,
        });
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <FormattedMessage id="common.delete" />
        </TooltipContent>
      </Tooltip>
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
          <Button variant="destructive" className="gap-2" onClick={onClick}>
            {deleteExamBlankPending || deleteResponsePending ? (
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
