import { ArrowRight } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { Exam } from '@corrector/functions';

import { trpc, useIntl, useOnExamFileDrop } from '~/lib';

import { LoadingButton } from '../shared';
import { Upload } from '../Upload';
import { ExamUploadedPdf } from './ExamUploadedPdf';

type ExamUploadedSubjectProps = {
  exam: Exam;
};

export const ExamUploadSubject = ({
  exam,
}: ExamUploadedSubjectProps): ReactElement => {
  const utils = trpc.useUtils();
  const t = useIntl();
  const { onDrop, isLoading: dropLoading } = useOnExamFileDrop(
    'uploadSubject',
    async () => {
      await utils.examSubjectPresignedUrlGet.invalidate();
    },
  );
  const { mutate: setReady, isPending } = trpc.examSetReady.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
    },
  });

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
        label={t.formatMessage({ id: 'exams.dragAndDrop.subject' })}
        accept="pdf"
      />
      <div className="relative h-full">
        <ExamUploadedPdf examId={exam.id} />
      </div>
      <LoadingButton
        className="self-end flex gap-2"
        onClick={() => {
          setReady({ id: exam.id });
        }}
        Icon={ArrowRight}
        label={t.formatMessage({ id: 'exams.setReady' })}
        loading={isPending}
      />
    </div>
  );
};
