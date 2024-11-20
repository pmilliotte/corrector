import { AuthSession, confirmSignUp } from '@aws-amplify/auth';
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
import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  Input,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Label,
} from '../ui';

interface UserSignupFormProps extends React.HTMLAttributes<HTMLDivElement> {
  refetchAuthSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AuthSession>>;
  setLoginState: (loginState: 'login' | 'newPasswordRequired') => void;
}

export const ConfirmSignupForm = ({
  className,
  refetchAuthSession,
  setLoginState,
  ...props
}: UserSignupFormProps): React.ReactElement => {
  const t = useIntl();
  const [confirmSignupError, setConfirmSignupError] = useState(false);

  const formSchema = z.object({
    confirmationCode: z
      .string()
      .min(
        6,
        t.formatMessage({
          id: 'login.confirmSignupCodeError',
        }),
      )
      .max(
        6,
        t.formatMessage({
          id: 'login.confirmSignupCodeError',
        }),
      ),
    email: z.string().email(
      t.formatMessage({
        id: 'login.emailError',
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmationCode: '',
      email: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({
      confirmationCode,
      email,
    }: z.infer<typeof formSchema>) => {
      setConfirmSignupError(false);
      try {
        const confirmSignUpResp = await confirmSignUp({
          confirmationCode,
          username: email,
        });

        if (confirmSignUpResp.isSignUpComplete) {
          await refetchAuthSession();
          setLoginState('login');
        }
      } catch {
        setConfirmSignupError(true);
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
            <FormattedMessage id="login.confirmSignup" />
          </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ email, confirmationCode }) =>
            submit({ email, confirmationCode }),
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
            name="confirmationCode"
            render={({ field }) => (
              <FormItem className="flex-grow mb-8">
                <FormControl>
                  <>
                    <Label
                      htmlFor="confirmationCode"
                      className="text-muted-foreground"
                    >
                      <FormattedMessage id="login.confirmSignupCode" />
                    </Label>
                    <InputOTP maxLength={6} {...field} id="confirmationCode">
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="p-2 gap-2" disabled={isPending}>
            {isPending && <LoadingSpinner />}
            <FormattedMessage id="login.letsGo" />
          </Button>
          {form.formState.errors.email !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.email.message}
            </div>
          ) : form.formState.errors.confirmationCode !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.confirmationCode.message}
            </div>
          ) : confirmSignupError ? (
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
