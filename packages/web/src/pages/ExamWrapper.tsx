import { Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { ExamTabsContent, ExamTitle } from '~/components';
import { Separator } from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

export const ExamWrapper = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const { selectedOrganization } = useUserOrganizations();

  const { data, isLoading } = trpc.examGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (data === undefined) {
    return <></>;
  }

  const { exam } = data;

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <>
        <ExamTitle
          name={exam.name}
          subject={exam.subject}
          created={exam.created}
        />
        <Separator />
        <ExamTabsContent status={exam.status} id={exam.id} />
      </>
    </div>
  );
};
