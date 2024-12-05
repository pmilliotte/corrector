import { Ban, FileCheck, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { FILE_TYPES, FileType } from '@corrector/shared';

import { trpc, useOnDrop } from '~/lib';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui';
import { Upload } from '../Upload';
import { ExamFile } from './ExamFile';

type ExamFilesProps = {
  examId: string;
  fileNames?: Partial<
    Record<FileType, { originalFileName: string; url: string }>
  >;
};

export const ExamFiles = ({
  examId,
  fileNames,
}: ExamFilesProps): ReactElement => {
  const utils = trpc.useUtils();
  const { onDrop, isLoading } = useOnDrop(async () => {
    await utils.examFilesGet.invalidate().then(() => {});
  });

  return (
    <>
      <div className="flex flex-col">
        <div className="font-semibold">
          <FormattedMessage id="exams.files.title" />
        </div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage id="exams.files.description" />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        <Accordion type="single" collapsible className="w-full">
          {FILE_TYPES.map(fileType => {
            const fileInfo = fileNames?.[fileType];

            return (
              <AccordionItem value={fileType} key={fileType}>
                {fileInfo !== undefined ? (
                  <>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2">
                        <FileCheck size={16} />
                        <FormattedMessage id={`exams.files.${fileType}`} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ExamFile
                        url={fileInfo.url}
                        fileType={fileType}
                        examId={examId}
                      />
                    </AccordionContent>
                  </>
                ) : (
                  <>
                    <AccordionTrigger>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {fileNames === undefined ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Ban size={16} />
                        )}
                        <FormattedMessage id={`exams.files.${fileType}`} />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Upload
                        onDrop={onDrop({ fileType, examId })}
                        loading={isLoading}
                      />
                    </AccordionContent>
                  </>
                )}
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </>
  );
};
