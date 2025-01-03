import { fetchAuthSession, signOut } from '@aws-amplify/auth';
import { useQuery } from '@tanstack/react-query';
import { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  ConfirmSignupForm,
  LoginForm,
  LoginState,
  SignupForm,
  UpdatePasswordForm,
} from '~/components';
import { Button } from '~/components/ui';
import { AppRoute } from '~/lib';

const getLoginState = (stateSearchParam: string | null): LoginState => {
  switch (stateSearchParam) {
    case 'signup':
    case 'confirmSignup':
      return stateSearchParam;
    default:
      return 'login';
  }
};

const getOppositeLoginState = (state: LoginState): LoginState => {
  switch (state) {
    case 'login':
      return 'signup';
    case 'signup':
      return 'login';
    default:
      return state;
  }
};

export const Login = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const [loginState, setLoginState] = useState<LoginState>(
    getLoginState(searchParams.get('state')),
  );
  const {
    data: authSession,
    isError: isAuthSessionError,
    refetch,
  } = useQuery({
    queryKey: ['authSession'],
    queryFn: () => fetchAuthSession(),
    retry: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthSessionError) {
      void signOut({ global: true });
      navigate(AppRoute.Login);
    }
    if (authSession?.tokens !== undefined) {
      navigate(AppRoute.Home);
    }
  }, [navigate, authSession, isAuthSessionError]);

  return (
    <div className="h-full">
      <div className="relative flex h-full flex-col items-center justify-center">
        <div className="relative h-full flex flex-col">
          <div className="mx-auto flex-grow flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                <FormattedMessage id="common.title" />
              </h1>
              <p className="text-sm text-muted-foreground">
                <FormattedMessage id="login.slogan" />
              </p>
            </div>
            {loginState === 'login' && (
              <LoginForm
                refetchAuthSession={refetch}
                setLoginState={setLoginState}
              />
            )}
            {loginState === 'newPasswordRequired' && (
              <UpdatePasswordForm refetchAuthSession={refetch} />
            )}
            {loginState === 'signup' && (
              <SignupForm
                refetchAuthSession={refetch}
                setLoginState={setLoginState}
              />
            )}
            {loginState === 'confirmSignup' && (
              <ConfirmSignupForm
                refetchAuthSession={refetch}
                setLoginState={setLoginState}
              />
            )}
          </div>
          <p className="px-8 text-center text-sm text-muted-foreground mb-8">
            <FormattedMessage id="login.copyright" />
          </p>
        </div>
        {['login', 'signup'].includes(loginState) && (
          <Button
            onClick={() =>
              setLoginState(prevState => getOppositeLoginState(prevState))
            }
            className="absolute top-4 right-4"
            variant="ghost"
          >
            <FormattedMessage
              id={`login.${getOppositeLoginState(loginState)}`}
            />
          </Button>
        )}
      </div>
    </div>
  );
};
