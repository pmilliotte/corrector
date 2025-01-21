import { ExternalLink } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import { Button } from '../ui';

type ExamReadyProps = {
  examId: string;
};

export const ExamReady = ({ examId }: ExamReadyProps): ReactElement => {
  const { data: url } = trpc.examSubjectPresignedUrlGet.useQuery({
    examId,
  });

  return (
    <div className="flex flex-col gap-2 h-full">
      <div>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={() => window.open(url, '_blank')}
          disabled={url === undefined}
        >
          <ExternalLink size={16} />
          <FormattedMessage id="exams.ready.open" />
        </Button>
      </div>
    </div>
  );
};
