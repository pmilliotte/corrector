import { AuthSession, confirmSignIn } from '@aws-amplify/auth';
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
import { Button, Form, FormControl, FormField, FormItem, Input } from '../ui';
import { PASSWORD_REGEXP } from './types';

interface UpdatePasswordFormProps extends React.HTMLAttributes<HTMLDivElement> {
  refetchAuthSession: (
    options?: RefetchOptions | undefined,
  ) => Promise<QueryObserverResult<AuthSession>>;
}

export const UpdatePasswordForm = ({
  className,
  refetchAuthSession,
  ...props
}: UpdatePasswordFormProps): React.ReactElement => {
  const t = useIntl();
  const formSchema = z
    .object({
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
      confirmNewPassword: z.string(),
    })
    .superRefine(({ newPassword, confirmNewPassword }, context) => {
      if (newPassword !== confirmNewPassword) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: t.formatMessage({
            id: 'login.passwordMatchError',
          }),
          path: ['newPassword'],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({ newPassword }: z.infer<typeof formSchema>) => {
      await confirmSignIn({
        challengeResponse: newPassword,
      });
      await refetchAuthSession();
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
          onSubmit={form.handleSubmit(({ newPassword, confirmNewPassword }) =>
            submit({ newPassword, confirmNewPassword }),
          )}
          className="flex flex-col space-y-2"
        >
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
            name="confirmNewPassword"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <Input
                    placeholder={t.formatMessage({
                      id: 'login.confirmNewPassword',
                    })}
                    type="password"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="p-2 gap-2" disabled={isPending}>
            {isPending && <LoadingSpinner />}
            <FormattedMessage id="login.letsGo" />
          </Button>
          {form.formState.errors.newPassword !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.newPassword.message}
            </div>
          ) : form.formState.errors.confirmNewPassword !== undefined ? (
            <div className="text-sm text-destructive">
              {form.formState.errors.confirmNewPassword.message}
            </div>
          ) : (
            <></>
          )}
        </form>
      </Form>
    </div>
  );
};
