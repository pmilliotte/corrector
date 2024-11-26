import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

import { Layout } from '~/components';
import { AppRoute } from '~/lib';

export const Home = (): ReactElement => (
  <Layout>
    <Navigate to={AppRoute.Exams} />
  </Layout>
);
