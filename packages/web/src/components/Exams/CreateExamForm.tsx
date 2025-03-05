import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { SUBJECTS } from '@corrector/shared';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui';
import { AppRoute, trpc, useIntl, useUserOrganizations } from '~/lib';

import { LoadingButton } from '../shared';

type CreateExamFormProps = { labelPosition?: 'top' | 'left' };

const formSchema = z.object({
  name: z.string(),
  subject: z.enum(SUBJECTS),
});

export const CreateExamForm = ({
  labelPosition = 'left',
}: CreateExamFormProps): ReactElement => {
  const t = useIntl();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.examCreate.useMutation({
    onSuccess: async ({ id }) => {
      await utils.examList.invalidate();
      navigate(`${AppRoute.Exams}/${id}`);
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      subject: undefined,
    },
  });

  const onSubmit = ({ name, subject }: z.infer<typeof formSchema>) => {
    mutate({
      name,
      subject,
      organizationId: selectedOrganization.id,
    });
  };

  const wrapperClassName = labelPosition === 'top' ? '' : 'grid gap-4 py-4';
  const itemClassName =
    labelPosition === 'top' ? '' : 'grid grid-cols-4 items-center gap-4';

  const {
    formState: { errors },
  } = form;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className={wrapperClassName}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className={itemClassName}>
                  <FormLabel
                    htmlFor="name"
                    className={labelPosition === 'left' ? 'text-right' : ''}
                  >
                    <FormattedMessage id="exams.name" />
                  </FormLabel>
                  <FormControl className="min-w-[240px]">
                    <Input
                      className="col-span-3"
                      placeholder={t.formatMessage({
                        id: 'exams.namePlaceholder',
                      })}
                      {...field}
                    />
                  </FormControl>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <div className={itemClassName}>
                  <FormLabel
                    htmlFor="subject"
                    className={labelPosition === 'left' ? 'text-right' : ''}
                  >
                    <FormattedMessage id="exams.subject" />
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl className="min-w-[240px]">
                      <SelectTrigger
                        id="subject"
                        className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0 col-span-3"
                      >
                        <SelectValue
                          placeholder={t.formatMessage({
                            id: 'common.select',
                          })}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent
                      position="popper"
                      className="max-w-[var(--radix-select-trigger-width)] overflow-y-auto max-h-[12rem]"
                    >
                      {SUBJECTS.map(subject => (
                        <SelectItem
                          value={subject}
                          key={subject}
                          className="max-w-100"
                          disabled={subject !== 'mathematics'}
                        >
                          <FormattedMessage id={`common.subjects.${subject}`} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            loading={isPending}
            label={t.formatMessage({ id: 'exams.save' })}
            Icon={Save}
            iconPosition="left"
            disabled={isPending || Object.keys(errors).length > 0}
          />
        </div>
      </form>
    </Form>
  );
};
