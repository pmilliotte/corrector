import { FileWarning, MoveLeft, MoveRight } from 'lucide-react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

import { FileType } from '@corrector/shared';

import { Button, Skeleton } from '../ui';
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
}: ExamFilesProps): ReactElement => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(ref.current?.offsetWidth);
  const [numberOfPages, setNumberOfPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    setWidth(Math.min(ref.current?.offsetWidth ?? 0, 700));
  }, [ref]);

  console.log('pageNumber', pageNumber);
  console.log('numberOfPages', numberOfPages);

  return (
    <div className="w-full flex items-center justify-around p-8">
      <div className="w-full flex flex-col items-center gap-2" ref={ref}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() =>
              setPageNumber(prevPageNumber =>
                prevPageNumber === 1 ? numberOfPages : prevPageNumber - 1,
              )
            }
          >
            <MoveLeft size={16} />
          </Button>
          <DeleteFileDialog fileType={fileType} examId={examId} />
          <Button
            variant="outline"
            onClick={() =>
              setPageNumber(prevPageNumber =>
                prevPageNumber === numberOfPages ? 1 : prevPageNumber + 1,
              )
            }
          >
            <MoveRight size={16} />
          </Button>
        </div>
        <Document
          className="border border-solid border-primary"
          file={url}
          onLoadSuccess={({ numPages }) => {
            setNumberOfPages(numPages);
          }}
          loading={() => <Skeleton className="w-[142px] h-[200px]" />}
          noData={() => <Skeleton className="w-[142px] h-[200px]" />}
          error={() => (
            <div className="w-[142px] h-[200px] flex items-center justify-around border border-solid rounded-sm bg-muted">
              <FileWarning />
            </div>
          )}
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};
