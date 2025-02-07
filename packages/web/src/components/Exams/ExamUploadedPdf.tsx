import { Check, FileWarning, Loader2, Trash2 } from 'lucide-react';
import { ReactElement } from 'react';
import { Document, Page } from 'react-pdf';

import { trpc } from '~/lib';

import { Button } from '../ui';

type ExamUploadedPdfProps = {
  examId: string;
};

export const ExamUploadedPdf = ({
  examId,
}: ExamUploadedPdfProps): ReactElement => {
  const utils = trpc.useUtils();
  const { data } = trpc.subjectPresignedUrlGet.useQuery(
    {
      examId,
      entity: 'exam',
    },
    { refetchOnMount: false },
  );
  const { mutate: removeFile, isPending: removeFilePending } =
    trpc.examUploadedSubjectDelete.useMutation({
      onSuccess: async () => {
        await utils.subjectPresignedUrlGet.invalidate();
      },
    });

  return data?.exists === true ? (
    <Document
      className="flex flex-col items-center justify-around gap-2 w-[250px] relative"
      file={data.url}
      loading={() => <Loader2 />}
      noData={() => (
        <div className="h-full flex items-center justify-around">
          <FileWarning />
        </div>
      )}
      error={() => (
        <div className="h-full flex items-center justify-around">
          <FileWarning />
        </div>
      )}
    >
      <Page
        pageNumber={1}
        width={250}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        className="border rounded-lg overflow-hidden relative"
      />
      <div className="flex items-center gap-2 absolute bottom-0 left-[50%]  -translate-y-1/2 -translate-x-1/2">
        <div className="rounded-full border w-9 h-9 flex items-center justify-center bg-white">
          <Check size={16} />
        </div>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full"
          onClick={() => removeFile({ examId })}
        >
          {removeFilePending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Trash2 size={16} className="text-destructive" />
          )}
        </Button>
      </div>
    </Document>
  ) : (
    <></>
  );
};
