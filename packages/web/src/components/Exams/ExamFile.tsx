import { FileWarning } from 'lucide-react';
import { ReactElement } from 'react';
import { Document, Thumbnail } from 'react-pdf';

import { FileType } from '@corrector/shared';

import { Skeleton } from '../ui';
import { DeleteFileDialog } from './DeleteFileDialog';

type ExamFilesProps = {
  examId: string;
  fileType: FileType;
  url: string;
};

export const ExamFile = ({
  url,
  fileType,
  examId,
}: ExamFilesProps): ReactElement => (
  <div className="flex items-center justify-around">
    <div className="flex items-center gap-2">
      <Document
        file={url}
        loading={() => <Skeleton className="w-[142px] h-[200px]" />}
        noData={() => <Skeleton className="w-[142px] h-[200px]" />}
        error={() => (
          <div className="w-[142px] h-[200px] flex items-center justify-around border border-solid rounded-sm bg-muted">
            <FileWarning />
          </div>
        )}
      >
        <Thumbnail pageNumber={1} height={200} width={142} />
      </Document>
      <DeleteFileDialog fileType={fileType} examId={examId} />
    </div>
  </div>
);
