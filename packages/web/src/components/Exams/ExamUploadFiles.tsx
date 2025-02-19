import compact from 'lodash/compact';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { Exam } from '@corrector/functions';

import { trpc, useIntl, useOnExamFileDrop } from '~/lib';

import { Button, ScrollArea, ScrollBar } from '../ui';
import { Upload } from '../Upload';
import { ExamUploadedImage } from './ExamUploadedImage';

type ExamUploadedFilesProps = {
  exam: Exam;
};

export const ExamUploadFiles = ({
  exam,
}: ExamUploadedFilesProps): ReactElement => {
  const utils = trpc.useUtils();
  const t = useIntl();
  const { onDrop, isLoading: dropLoading } = useOnExamFileDrop(
    'uploadFiles',
    async () => {
      await utils.examGet.invalidate();
    },
  );
  const { mutate: updateExam, isPending: updateExamPending } =
    trpc.examConfigureProblems.useMutation({
      onSettled: async () => {
        await utils.examGet.invalidate();
      },
    });

  useEffect(() => {
    if (exam.status !== 'configureProblemsRequested') {
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
  }, [exam.status, utils.examGet]);

  const files = compact(Object.values(exam.problems.uploadFiles));

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="font-semibold">
        <FormattedMessage id="common.step" values={{ step: 1 }} />
        <span> : </span>
        <FormattedMessage id="exams.upload.problem.label" />
      </div>
      <Upload
        onDrop={onDrop({ examId: exam.id })}
        loading={dropLoading}
        label={t.formatMessage({ id: 'exams.dragAndDrop.problem' })}
        accept="image"
        disabled={
          updateExamPending || files.some(({ status }) => status !== 'analyzed')
        }
      />
      <div className="relative h-full">
        <ScrollArea>
          <div className="flex space-x-4 py-2 pb-2">
            {compact(Object.entries(exam.problems.uploadFiles)).map(
              ([fileName, file]) =>
                file !== undefined && (
                  <ExamUploadedImage
                    key={fileName}
                    examId={exam.id}
                    fileName={fileName}
                    fileStatus={file.status}
                  />
                ),
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <Button
        className="self-end flex gap-2"
        onClick={() => updateExam({ id: exam.id })}
        disabled={
          files.length === 0 ||
          files.some(({ status }) => status !== 'analyzed') ||
          updateExamPending ||
          exam.status === 'configureProblemsRequested'
        }
      >
        <FormattedMessage id="exams.configureProblems" values={{ step: 2 }} />
        {updateExamPending || exam.status === 'configureProblemsRequested' ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
      </Button>
    </div>
  );
};
