import { resetPassword } from '@aws-amplify/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Loader2, RefreshCcw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { cn, useIntl } from '~/lib';

import { Button, Form, FormControl, FormField, FormItem, Input } from '../ui';
import { LoginState } from './types';

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  setLoginState: (loginState: LoginState) => void;
}

export const ResetPasswordForm = ({
  className,
  setLoginState,
  ...props
}: UserAuthFormProps): React.ReactElement => {
  const t = useIntl();
  const formSchema = z.object({
    email: z.string().email(
      t.formatMessage({
        id: 'login.emailError',
      }),
    ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: async ({ email }: z.infer<typeof formSchema>) => {
      const signInResp = await resetPassword({ username: email });

      if (
        signInResp.nextStep.resetPasswordStep ===
        'CONFIRM_RESET_PASSWORD_WITH_CODE'
      ) {
        setLoginState('confirmResetPassword');

        return;
      }
    },
  });

  return (
    <div className={cn('grid gap-6 relative', className)} {...props}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Réinitialiser le mot de passe
          </span>
        </div>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(({ email }) => submit({ email }))}
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
          <Button type="submit" className="p-2 gap-2" disabled={isPending}>
            {isPending ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <RefreshCcw size={16} />
            )}
            Recevoir le code
          </Button>
          <div className="text-sm text-destructive absolute bottom-0 translate-y-full">
            {form.formState.errors.email !== undefined ? (
              form.formState.errors.email.message
            ) : (
              <></>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
