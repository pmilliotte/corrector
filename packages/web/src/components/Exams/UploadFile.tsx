import { CircleX, Loader2 } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { FileType } from '@corrector/shared';

import { SelectedFile, useOnDrop } from '~/lib';

import { Button } from '../ui';
import { Upload } from '../Upload';

type UploadSubjectProps = {
  examId: string;
  file: SelectedFile;
  fileType: FileType;
  callback?: () => PromiseLike<void>;
  cancel?: { function: () => void; loading: boolean };
};

export const UploadFile = ({
  examId,
  file,
  fileType,
  callback,
  cancel,
}: UploadSubjectProps): ReactElement => {
  const [loading, setLoading] = useState(false);
  const { onDrop, isLoading: dropLoading } = useOnDrop(async (_id: string) => {
    setLoading(true);
    await callback?.();

    return Promise.resolve();
  });

  useEffect(() => {
    if (!loading || callback === undefined) {
      return;
    }
    const interval = setInterval(() => {
      void callback();
    }, 2000);

    return () => {
      clearInterval(interval);
      setLoading(false);
    };
  }, [loading, callback]);

  return (
    <div className="h-full flex items-center justify-around">
      <div className="flex flex-col items-center gap-2">
        <div className="text-muted-foreground">
          <FormattedMessage id={`exams.upload.${fileType}`} />
        </div>
        <Upload
          onDrop={onDrop({ fileType, examId, fileId: file.id })}
          loading={dropLoading || loading}
        />
        {cancel !== undefined && (
          <Button
            onClick={cancel.function}
            variant="outline"
            className="flex items-center gap-2"
          >
            {cancel.loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CircleX size={16} />
            )}
            <FormattedMessage id="common.cancel" />
          </Button>
        )}
      </div>
    </div>
  );
};
