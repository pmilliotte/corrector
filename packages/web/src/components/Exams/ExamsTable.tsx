import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc } from '~/lib';

import { CreateExamDialog } from './CreateExamDialog';
import { DataTable } from './DataTable';

export const ExamsTable = (): ReactElement => {
  const { data } = trpc.examList.useQuery();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <FormattedMessage id="exams.title" />
        </div>
        <CreateExamDialog />
      </div>
      {data === undefined ? <></> : <DataTable exams={data.exams} />}
    </div>
  );
};
