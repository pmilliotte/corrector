import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { Separator } from '~/components/ui';
import { trpc, useIntl } from '~/lib';

export const ExamWrapper = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const t = useIntl();
  const { data: exam, isLoading } = trpc.examGet.useQuery({
    id: examId,
  });

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (exam === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  const { subject, created, name } = exam;

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
          <FormattedMessage
            id="exams.exam.title"
            values={{
              subject: t.formatMessage({
                id: `common.subjects.${subject}`,
              }),
              name,
            }}
          />
        </span>
        <div className="text-muted-foreground text-sm whitespace-nowrap shrink-0">
          <FormattedMessage
            id="exams.createdOn"
            values={{
              date: new Date(created).toLocaleDateString('fr'),
            }}
          />
        </div>
      </div>
      <Separator />
    </div>
  );
};
