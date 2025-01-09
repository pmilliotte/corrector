import { AuthSession, signIn } from '@aws-amplify/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from '@tanstack/react-query';
import { KeyRound, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { cn, useIntl } from '~/lib';

import { Button, Form, FormControl, FormField, FormItem, Input } from '../ui';
import { LoginState } from './types';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  refetchAuthSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AuthSession>>;
  setLoginState: (loginState: LoginState) => void;
}

export const LoginForm = ({
  className,
  refetchAuthSession,
  setLoginState,
  ...props
}: UserAuthFormProps): React.ReactElement => {
  const t = useIntl();
  const [signinError, setSigninError] = useState(false);

  const formSchema = z.object({
    email: z.string().email(
      t.formatMessage({
        id: 'login.emailError',
      }),
    ),
    password: z.string().min(
      8,
      t.formatMessage({
        id: 'login.passwordMinError',
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({ email, password }: z.infer<typeof formSchema>) => {
      setSigninError(false);
      try {
        const signInResp = await signIn({ username: email, password });

        if (
          signInResp.nextStep.signInStep ===
          'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'
        ) {
          setLoginState('newPasswordRequired');
        }
        if (signInResp.isSignedIn) {
          await refetchAuthSession();
        }
      } catch (e) {
        setSigninError(true);
      }
    },
  });

  return (
    <div className={cn('grid gap-6', className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            <FormattedMessage id="login.login" />
          </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ email, password }) =>
            submit({ email, password }),
          )}
          className="flex flex-col space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({ id: 'login.email' })}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({ id: 'login.password' })}
                    type="password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="p-2 gap-2" disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <KeyRound size={16} />
            )}
            <FormattedMessage id="login.letsGo" />
          </Button>
          {form.formState.errors.email !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </div>
          ) : form.formState.errors.password !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </div>
          ) : signinError ? (
            <div className="text-sm text-destructive">
              <FormattedMessage id="login.signinError" />
            </div>
          ) : (
            <></>
          )}
        </form>
      </Form>
    </div>
  );
};
