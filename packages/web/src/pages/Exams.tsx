import { ReactElement } from 'react';

import { ExamsTable, Layout } from '~/components';

export const Exams = (): ReactElement => (
  <Layout>
    <div className="p-4">
      <ExamsTable />
    </div>
  </Layout>
);
