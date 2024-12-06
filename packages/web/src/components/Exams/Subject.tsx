import { Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_BLANK } from '@corrector/shared';

import { trpc, useOnDrop, useUserOrganizations } from '~/lib';

import { Upload } from '../Upload';
import { ExamFile } from './ExamFile';

type SubjectProps = {
  examId: string;
};

export const Subject = ({ examId }: SubjectProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const { data: url, isLoading: urlLoading } = trpc.examFileGet.useQuery(
    {
      id: examId,
      organizationId: selectedOrganization.id,
      fileType: EXAM_BLANK,
    },
    { refetchOnMount: false },
  );
  const { onDrop, isLoading: dropLoading } = useOnDrop(async () => {
    await utils.examFileGet.invalidate().then(() => {});
  });

  if (urlLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-around">
      {url?.url === undefined ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-muted-foreground">
            <FormattedMessage id="exams.status.subject.description" />
          </div>
          <Upload
            onDrop={onDrop({ fileType: EXAM_BLANK, examId })}
            loading={dropLoading}
          />
        </div>
      ) : (
        <ExamFile url={url.url} fileType={EXAM_BLANK} examId={examId} />
      )}
    </div>
  );
};
