import { AuthSession, confirmResetPassword } from '@aws-amplify/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  QueryObserverResult,
  RefetchOptions,
  useMutation,
} from '@tanstack/react-query';
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
import { LoginState, PASSWORD_REGEXP } from './types';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  refetchAuthSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AuthSession>>;
  setLoginState: (loginState: LoginState) => void;
}

export const ConfirmResetPasswordForm = ({
  className,
  refetchAuthSession,
  setLoginState,
  ...props
}: UserAuthFormProps): React.ReactElement => {
  const t = useIntl();
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
    newPassword: z
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
    email: z.string().email(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirmationCode: '',
      newPassword: '',
      email: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({
      newPassword,
      confirmationCode,
      email,
    }: z.infer<typeof formSchema>) => {
      await confirmResetPassword({
        newPassword,
        confirmationCode,
        username: email,
      });
      await refetchAuthSession();
      setLoginState('login');
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
            <FormattedMessage id="login.changePassword" />
          </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            ({ newPassword, email, confirmationCode }) =>
              submit({ newPassword, confirmationCode, email }),
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
            name="newPassword"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({ id: 'login.newPassword' })}
                    type="password"
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
          <div className="text-sm text-destructive absolute bottom-0 translate-y-full">
            {form.formState.errors.email !== undefined ? (
              form.formState.errors.email.message
            ) : form.formState.errors.confirmationCode !== undefined ? (
              form.formState.errors.confirmationCode.message
            ) : form.formState.errors.newPassword !== undefined ? (
              form.formState.errors.newPassword.message
            ) : (
              <></>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
