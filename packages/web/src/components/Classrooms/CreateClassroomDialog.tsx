/* eslint-disable max-lines */
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { DIVISIONS, SCHOOL_YEARS } from '@corrector/shared';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

const formSchema = z.object({
  classroomName: z.string().min(1),
  division: z.enum(DIVISIONS),
  schoolYear: z.enum(SCHOOL_YEARS),
});

type CreateClassroomDialogProps = { schoolId: string };

export const CreateClassroomDialog = ({
  schoolId,
}: CreateClassroomDialogProps): ReactElement => {
  const t = useIntl();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.classroomCreate.useMutation({
    onSuccess: ({ id }) => {
      navigate(`${AppRoute.Classrooms}/${id}/users`);
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classroomName: '',
      division: undefined,
      schoolYear: SCHOOL_YEARS[SCHOOL_YEARS.length - 1],
    },
  });

  const onSubmit = ({
    classroomName,
    division,
    schoolYear,
  }: z.infer<typeof formSchema>) => {
    mutate({
      classroomName,
      schoolId,
      division,
      organizationId: selectedOrganization.id,
      schoolYear,
    });
  };

  const {
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1" variant="outline">
          <Plus size={16} />
          Ajouter une classe
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="classrooms.create" />
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-[min-content_1fr] gap-4 py-4">
              <FormField
                control={form.control}
                name="classroomName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                    <FormLabel
                      htmlFor="classroomName"
                      className="text-right whitespace-nowrap"
                    >
                      Nom de la classe
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="schoolYear"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                    <FormLabel
                      htmlFor="schoolYear"
                      className="text-right whitespace-nowrap"
                    >
                      Année scolaire
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="schoolYear"
                          className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0"
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
                        {SCHOOL_YEARS.map(schoolYear => (
                          <SelectItem
                            value={schoolYear}
                            key={schoolYear}
                            className="max-w-100"
                          >
                            {schoolYear}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
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
                          className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0"
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
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="submit"
                disabled={isPending || Object.keys(errors).length > 0}
                className="gap-2"
              >
                {isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                <FormattedMessage id="common.save" />
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
