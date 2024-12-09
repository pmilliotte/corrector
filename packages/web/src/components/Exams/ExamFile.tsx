import { FileWarning, Loader2, MoveLeft, MoveRight } from 'lucide-react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { Document, Page } from 'react-pdf';

import { FileType } from '@corrector/shared';

import { Button } from '../ui';
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

  return (
    <div className="w-full h-full" ref={ref}>
      <Document
        className="w-full h-full flex flex-col items-center justify-around gap-2"
        file={url}
        onLoadSuccess={({ numPages }) => {
          setNumberOfPages(numPages);
        }}
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
        <Page
          pageNumber={pageNumber}
          width={width}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className="border border-solid border-primary "
        />
      </Document>
    </div>
  );
};
