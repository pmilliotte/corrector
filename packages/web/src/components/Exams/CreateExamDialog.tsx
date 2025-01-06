/* eslint-disable max-lines */
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus } from 'lucide-react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { DIVISIONS, SUBJECTS } from '@corrector/shared';

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

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui';

const formSchema = z.object({
  name: z.string(),
  subject: z.enum(SUBJECTS),
  division: z.enum(DIVISIONS),
});

export const CreateExamDialog = (): ReactElement => {
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
      division: undefined,
    },
  });

  const onSubmit = ({
    name,
    subject,
    division,
  }: z.infer<typeof formSchema>) => {
    mutate({
      name,
      subject,
      division,
      organizationId: selectedOrganization.id,
    });
  };

  const {
    formState: { errors },
  } = form;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus size={16} />
          <FormattedMessage id="exams.create" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="exams.create" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage id="exams.createDescription" />
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="name" className="text-right">
                        <FormattedMessage id="exams.name" />
                      </FormLabel>
                      <FormControl>
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
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="division" className="text-right">
                        <FormattedMessage id="common.level" />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            id="division"
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
                          {DIVISIONS.map(division => (
                            <SelectItem
                              value={division}
                              key={division}
                              className="max-w-100"
                            >
                              <FormattedMessage
                                id={`common.divisions.${division}`}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <FormLabel htmlFor="subject" className="text-right">
                        <FormattedMessage id="exams.subject" />
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
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
                            >
                              <FormattedMessage
                                id={`common.subjects.${subject}`}
                              />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending || Object.keys(errors).length > 0}
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FormattedMessage id="exams.save" />
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
