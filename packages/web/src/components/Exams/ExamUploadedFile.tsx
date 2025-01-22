import { Check, CircleAlert, Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { ExamUploadedFileStatus } from '@corrector/shared';

import { trpc } from '~/lib';

import { Button } from '../ui';

type ExamUploadedFileProps = {
  fileName: string;
  fileStatus: ExamUploadedFileStatus;
  examId: string;
};

export const ExamUploadedFile = ({
  fileName,
  examId,
  fileStatus,
}: ExamUploadedFileProps): ReactElement => {
  const utils = trpc.useUtils();
  const { data: url } = trpc.examUploadedFilePresignedUrlGet.useQuery(
    {
      examId,
      fileName,
    },
    { refetchOnMount: false },
  );
  const { mutate: removeFile, isPending: removeFilePending } =
    trpc.examUploadedFileDelete.useMutation({
      onSuccess: async () => {
        await utils.examGet.invalidate();
      },
    });

  useEffect(() => {
    if (fileStatus === 'analyzed' || fileStatus === 'error') {
      return;
    }

    const interval = setInterval(() => {
      void utils.examGet.invalidate();
    }, 2000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 50000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [utils, fileStatus]);

  return (
    <div className="relative" key={fileName}>
      <div className="w-[250px] aspect-[3/4] border rounded-lg overflow-hidden relative">
        <div
          style={{ backgroundImage: `url(${url})` }}
          className="bg-contain w-full h-full bg-no-repeat bg-center hover:scale-105"
        />
        {fileStatus === 'error' && (
          <div className="absolute top-0 right-0 left-0 bottom-0 flex items-center justify-center text-center text-sm p-2 bg-white bg-opacity-70">
            <FormattedMessage id="exams.file.error" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 absolute bottom-0 left-[50%]  -translate-y-1/2 -translate-x-1/2">
        <div className="rounded-full border w-9 h-9 flex items-center justify-center bg-white">
          {fileStatus === 'error' ? (
            <CircleAlert size={16} />
          ) : url === undefined || fileStatus !== 'analyzed' ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Check size={16} />
          )}
        </div>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => removeFile({ fileName, examId })}
        >
          {removeFilePending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Trash2 size={16} className="text-destructive" />
          )}
        </Button>
      </div>
    </div>
  );
};
