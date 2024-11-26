import { Upload as UploadIcon } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { FileType } from '@corrector/shared';

import { trpc, useOnDrop } from '~/lib';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui';
import { Upload } from '../Upload';

type UploadFileDialogProps = { fileType: FileType; examId: string };

export const UploadFileDialog = ({
  fileType,
  examId,
}: UploadFileDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const { onDrop, isLoading } = useOnDrop(async () => {
    await utils.examFilesGet.invalidate().then(() => setOpen(false));
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UploadIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            <FormattedMessage id={`exams.files.${fileType}`} />
          </DialogTitle>
          <DialogDescription>
            <FormattedMessage id="exams.files.upload" />
          </DialogDescription>
        </DialogHeader>
        <Upload onDrop={onDrop({ fileType, examId })} loading={isLoading} />
      </DialogContent>
    </Dialog>
  );
};
