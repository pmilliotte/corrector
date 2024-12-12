import { Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { EXAM_BLANK } from '@corrector/shared';

import { ExamTitle } from '~/components';
import { ExamContent } from '~/components/Exams/ExamContent';
import { UploadFile } from '~/components/Exams/UploadFile';
import { Separator } from '~/components/ui';
import { trpc, useSelectedFile, useUserOrganizations } from '~/lib';

export const ExamWrapper = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const {
    selectedFile,
    setSelectedFile,
    exam,
    examLoading,
    responses,
    responsesLoading,
  } = useSelectedFile({
    examId,
    organizationId: selectedOrganization.id,
  });

  if (examLoading || responsesLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (exam === undefined || responses === undefined) {
    return <></>;
  }

  if (
    exam.status === 'toBeUploaded' ||
    exam.subjectFileName === undefined ||
    exam.subjectUploadedAt === undefined
  ) {
    return (
      <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
        <>
          <ExamTitle
            name={exam.name}
            subject={exam.subject}
            created={exam.created}
          />
          <Separator />
          <div className="grow">
            <UploadFile
              file={{ id: 'subject', status: 'toBeUploaded' }}
              examId={examId}
              fileType={EXAM_BLANK}
              callback={() => utils.examGet.refetch()}
            />
          </div>
        </>
      </div>
    );
  }

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <>
        <ExamTitle
          name={exam.name}
          subject={exam.subject}
          created={exam.created}
        />
        <Separator />
        <div className="grow">
          <ExamContent
            exam={{
              ...exam,
              subjectFileName: exam.subjectFileName,
              subjectUploadedAt: exam.subjectUploadedAt,
            }}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            responses={responses}
            responsesLoading={responsesLoading}
            examLoading={examLoading}
          />
        </div>
      </>
    </div>
  );
};
