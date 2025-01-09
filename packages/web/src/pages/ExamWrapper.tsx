import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { ExamUploadedFiles } from '~/components/Exams/ExamUploadedFiles';
import { Badge, Separator } from '~/components/ui';
import { trpc } from '~/lib';

export const ExamWrapper = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
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

  const { subject, created, name, status } = exam;

  const ExamContent = () => {
    switch (status) {
      case 'uploadProblems':
        return <ExamUploadedFiles examId={examId} />;
      default:
        return <></>;
    }
  };

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge>
            <FormattedMessage id={`common.subjects.${subject}`} />
          </Badge>
          <span className="font-semibold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
            {name}
          </span>
        </div>
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
      <div className="w-full h-full">
        <ExamContent />
      </div>
    </div>
  );
};
