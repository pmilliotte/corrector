import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { trpc, useIntl, useUserOrganizations } from '~/lib';

export const Exam = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const t = useIntl();
  const { selectedOrganization } = useUserOrganizations();

  const { data: exam } = trpc.examGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  return exam === undefined ? (
    <></>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="font-semibold text-xl">
          <FormattedMessage
            id="exams.exam.title"
            values={{
              subject: t.formatMessage({
                id: `common.subjects.${exam.exam.subject}`,
              }),
              name: exam.exam.name,
            }}
          />
        </div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage
            id="exams.createdOn"
            values={{
              date: new Date(exam.exam.created).toLocaleString().slice(0, 10),
            }}
          />
        </div>
      </div>
    </div>
  );
};
