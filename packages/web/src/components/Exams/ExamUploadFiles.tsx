import compact from 'lodash/compact';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
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
      onSuccess: async () => {
        await utils.examGet.invalidate();
      },
    });

  const files = compact(Object.values(exam.problems.uploadFiles));

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="font-semibold">
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        <FormattedMessage id="common.step" values={{ step: 1 }} /> :{' '}
        <FormattedMessage id="exams.upload.problem.label" />
      </div>
      <Upload
        onDrop={onDrop({ examId: exam.id })}
        loading={dropLoading}
        label={t.formatMessage({ id: 'exams.dragAndDrop.problem' })}
        accept="image"
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
          files
            .map(({ status }) => status)
            .some(status => status !== 'analyzed') ||
          updateExamPending
        }
      >
        <FormattedMessage id="exams.configureProblems" values={{ step: 2 }} />
        {updateExamPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}
      </Button>
    </div>
  );
};
