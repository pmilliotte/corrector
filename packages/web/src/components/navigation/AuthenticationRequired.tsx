import { fetchAuthSession, signOut } from '@aws-amplify/auth';
import { QueryClientContext, useQuery } from '@tanstack/react-query';
import posthog from 'posthog-js';
import { ReactElement, useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { getSession } from '@corrector/shared';

import { LoadingSpinner } from '~/components/icons/LoadingSpinner';
import { AppRoute, SessionContext } from '~/lib';

import { Layout } from '../Layout';

export const AuthenticationRequired = (): ReactElement => {
  const queryClient = useContext(QueryClientContext);
  const {
    data: authSession,
    isError: isAuthSessionError,
    isLoading: isAuthSessionLoading,
  } = useQuery({
    queryKey: ['authSession'],
    queryFn: () => fetchAuthSession({ forceRefresh: true }),
    retry: false,
  });

  const session =
    authSession?.tokens?.idToken?.payload === undefined
      ? undefined
      : getSession(authSession.tokens.idToken.payload);

  if (isAuthSessionLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-around">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (authSession?.tokens === undefined || isAuthSessionError) {
    void signOut({ global: true });
    void queryClient?.invalidateQueries({ queryKey: ['authSession'] });

    return <Navigate to={AppRoute.Login} />;
  }

  if (session === undefined) {
    void signOut({ global: true });
    void queryClient?.invalidateQueries({ queryKey: ['authSession'] });

    return <Navigate to={AppRoute.Error} />;
  }

  posthog.identify(session.id, {
    email: session.email,
  });

  return (
    <SessionContext.Provider value={session}>
      <Outlet />
    </SessionContext.Provider>
  );
};
