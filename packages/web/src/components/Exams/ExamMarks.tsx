import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { FileType } from '@corrector/shared';

import { Button } from '../ui';

type ExamFilesProps = {
  examId: string;
  fileNames?: Partial<
    Record<FileType, { originalFileName: string; url: string }>
  >;
};

export const ExamMarks = (
  {
    // examId,
    // fileNames,
  }: ExamFilesProps,
): ReactElement => {
  return (
    <>
      <div className="flex flex-col">
        <div className="font-semibold">
          <FormattedMessage id="exams.marks.title" />
        </div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage id="exams.marks.description" />
        </div>
      </div>
      <Button>
        <FormattedMessage id="exams.marks.analyze" />
      </Button>
    </>
  );
};
