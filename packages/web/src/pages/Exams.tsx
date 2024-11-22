import { ReactElement } from 'react';

import { Layout } from '~/components';
import { Input, Label } from '~/components/ui';

export const Exams = (): ReactElement => (
  <Layout>
    <>
      <Label htmlFor="picture">Picture</Label>
      <Input id="picture" type="file" />
    </>
  </Layout>
);
