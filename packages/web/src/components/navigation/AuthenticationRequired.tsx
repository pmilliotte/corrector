import { fetchAuthSession, signOut } from '@aws-amplify/auth';
import { QueryClientContext, useQuery } from '@tanstack/react-query';
import { ReactElement, useContext, useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import { getSession } from '@corrector/shared';

import { Layout } from '~/components';
import { LoadingSpinner } from '~/components/icons/LoadingSpinner';
import { AppRoute, SessionContext } from '~/lib';

export const AuthenticationRequired = (): ReactElement => {
  const navigate = useNavigate();
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

  useEffect(() => {
    const signoutAndNavigate = async () => {
      await signOut({ global: true });
      await queryClient?.invalidateQueries({ queryKey: ['authSession'] });
      navigate(AppRoute.Login);
    };
    if (
      isAuthSessionError ||
      (authSession?.tokens === undefined && !isAuthSessionLoading)
    ) {
      void signoutAndNavigate();
    }
  }, [
    authSession?.tokens,
    navigate,
    queryClient,
    isAuthSessionError,
    isAuthSessionLoading,
  ]);

  const session =
    authSession?.tokens?.idToken?.payload === undefined
      ? undefined
      : getSession(authSession.tokens.idToken.payload);

  if (isAuthSessionLoading || authSession?.tokens === undefined) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-around">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  if (session === undefined) {
    void signOut({ global: true });
    void queryClient?.invalidateQueries({ queryKey: ['authSession'] });

    return <Navigate to={AppRoute.Error} />;
  }

  return (
    <SessionContext.Provider value={session}>
      <Outlet />
    </SessionContext.Provider>
  );
};
