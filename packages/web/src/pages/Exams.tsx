import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { CreateExamDialog } from '~/components/Exams/CreateExamDialog';
import { trpc } from '~/lib';

import { ExamTable } from '../components/Exams/ExamTable';

export const Exams = (): ReactElement => {
  const { data: exams, isLoading } = trpc.examList.useQuery();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (exams === undefined) {
    return (
      <div className="h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <FormattedMessage id="exams.title" />
        </div>
        <CreateExamDialog />
      </div>
      <ExamTable exams={exams} />
    </div>
  );
};
