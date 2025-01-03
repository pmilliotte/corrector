/* eslint-disable max-lines */
import { AuthSession, signUp } from '@aws-amplify/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { cn, useIntl } from '~/lib';

import { LoadingSpinner } from '../icons/LoadingSpinner';
import { Button, Form, FormControl, FormField, FormItem, Input } from '../ui';
import { LoginState, PASSWORD_REGEXP } from './types';

interface UserSignupFormProps extends React.HTMLAttributes<HTMLDivElement> {
  refetchAuthSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AuthSession>>;
  setLoginState: (loginState: LoginState) => void;
}

export const SignupForm = ({
  className,
  refetchAuthSession,
  setLoginState,
  ...props
}: UserSignupFormProps): React.ReactElement => {
  const t = useIntl();
  const [signupError, setSignupError] = useState(false);

  const formSchema = z.object({
    firstName: z.string().min(1, t.formatMessage({ id: 'login.nameError' })),
    lastName: z.string().min(1, t.formatMessage({ id: 'login.nameError' })),
    email: z.string().email(
      t.formatMessage({
        id: 'login.emailError',
      }),
    ),
    password: z
      .string()
      .regex(
        PASSWORD_REGEXP,
        t.formatMessage({
          id: 'login.passwordRegexError',
        }),
      )
      .min(
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
      firstName: '',
      lastName: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({
      email,
      password,
      firstName,
      lastName,
    }: z.infer<typeof formSchema>) => {
      setSignupError(false);
      try {
        const signUpResp = await signUp({
          username: email,
          password,
          options: {
            userAttributes: {
              email,
              given_name: firstName,
              family_name: lastName,
            },
          },
        });

        if (signUpResp.nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
          setLoginState('confirmSignup');
        }
        if (signUpResp.isSignUpComplete) {
          await refetchAuthSession();
        }
      } catch {
        setSignupError(true);
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
            <FormattedMessage id="login.signup" />
          </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            ({ email, password, firstName, lastName }) =>
              submit({ email, password, firstName, lastName }),
          )}
          className="flex flex-col space-y-2"
        >
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({ id: 'login.lastName' })}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({ id: 'login.firstName' })}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
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
          <Button
            type="submit"
            className="p-2 gap-2"
            disabled={
              isPending || Object.keys(form.formState.errors).length > 0
            }
          >
            {isPending && <LoadingSpinner />}
            <FormattedMessage id="login.letsGo" />
          </Button>
          {form.formState.errors.firstName !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.firstName.message}
            </div>
          ) : form.formState.errors.lastName !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.lastName.message}
            </div>
          ) : form.formState.errors.email !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </div>
          ) : form.formState.errors.password !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.password.message}
            </div>
          ) : signupError ? (
            <div className="text-sm text-destructive">
              <FormattedMessage id="login.signupError" />
            </div>
          ) : (
            <></>
          )}
        </form>
      </Form>
    </div>
  );
};
