import { ReactElement } from 'react';

import { trpc, useUserOrganizations } from '~/lib';

type ExamMarksProps = {
  examId: string;
};

export const ExamMarks = ({ examId }: ExamMarksProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { data } = trpc.examMarksGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  return <div>{data?.response.examTitle}</div>;
};
