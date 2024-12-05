import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_BLANK } from '@corrector/shared';

import { trpc, useOnDrop, useUserOrganizations } from '~/lib';

import { Button } from '../ui';
import { Upload } from '../Upload';
import { ExamFile } from './ExamFile';

type SubjectProps = {
  examId: string;
};

export const Subject = ({ examId }: SubjectProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const { data: url, isLoading: urlLoading } = trpc.examFileGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
    fileType: EXAM_BLANK,
  });
  const { onDrop, isLoading: dropLoading } = useOnDrop(async () => {
    await utils.examFileGet.invalidate().then(() => {});
  });

  const { mutate: updateExamStatus, isPending: updateExamStatusPending } =
    trpc.examUpdate.useMutation({
      onSuccess: async () => {
        await utils.examGet.invalidate();
      },
    });

  if (urlLoading) {
    return (
      <div className="flex-grow flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <>
      {url?.url === undefined ? (
        <div className="flex-grow flex items-center justify-around gap-2">
          <div className="flex flex-col items-center gap-2">
            <div className="text-muted-foreground">
              <FormattedMessage id="exams.status.subject.description" />
            </div>
            <Upload
              onDrop={onDrop({ fileType: EXAM_BLANK, examId })}
              loading={dropLoading}
            />
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col gap-2">
          <div className="flex flex-grow gap-2 items-center justify-around">
            <ExamFile url={url.url} fileType={EXAM_BLANK} examId={examId} />
          </div>
          <Button
            className="self-end flex gap-2"
            onClick={() =>
              updateExamStatus({
                id: examId,
                organizationId: selectedOrganization.id,
                status: 'marks',
              })
            }
          >
            <FormattedMessage id="exams.marks.analyze" />
            {updateExamStatusPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <ArrowRight size={16} />
            )}
          </Button>
        </div>
      )}
    </>
  );
};
