import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';

import { ExamMarks, ExamTitle, Subject } from '~/components';
import { trpc, useUserOrganizations } from '~/lib';

export const Exam = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const { selectedOrganization } = useUserOrganizations();

  const { data: exam } = trpc.examGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  return (
    <div className="p-4 h-full flex flex-col gap-2">
      {exam === undefined ? (
        <></>
      ) : (
        <>
          <ExamTitle
            name={exam.exam.name}
            subject={exam.exam.subject}
            created={exam.exam.created}
          />

          {exam.exam.status === 'subject' && <Subject examId={examId} />}
          {exam.exam.status === 'marks' && <ExamMarks examId={examId} />}
        </>
      )}
    </div>
  );
};
