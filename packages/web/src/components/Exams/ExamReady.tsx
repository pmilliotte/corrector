import { ExternalLink } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import { Button } from '../ui';
import { AssignExamDialog } from './AssignExamDialog';

type ExamReadyProps = {
  examId: string;
};

export const ExamReady = ({ examId }: ExamReadyProps): ReactElement => {
  const { data } = trpc.examSubjectPresignedUrlGet.useQuery({
    examId,
  });

  return (
    <div className="flex flex-col gap-2 h-full">
      <div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() =>
            data?.exists === true && window.open(data.url, '_blank')
          }
          disabled={data?.exists !== true}
        >
          <ExternalLink size={16} />
          <FormattedMessage id="exams.ready.open" />
        </Button>
      </div>
      <div>
        <AssignExamDialog />
      </div>
    </div>
  );
};
