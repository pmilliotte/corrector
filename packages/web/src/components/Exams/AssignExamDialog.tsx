import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import groupBy from 'lodash/groupBy';
import { BookUser, CalendarIcon } from 'lucide-react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui';
import { cn, trpc, useIntl, useSession, useUserOrganizations } from '~/lib';

const formSchema = z.object({
  classId: z.string(),
  date: z.date(),
});

export const AssignExamDialog = (): ReactElement => {
  const t = useIntl();
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classrooms } = trpc.classroomList.useQuery({
    organizationId: selectedOrganization.id,
    userId,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      classId: undefined,
      date: new Date(),
    },
  });

  const onSubmit = ({ classId, date }: z.infer<typeof formSchema>) => {
    console.log({ classId, date });
  };

  const classroomByDivision = groupBy(classrooms, 'division');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <BookUser size={16} />
          <FormattedMessage id="exams.ready.assignToClass" />
        </Button>
      </DialogTrigger>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogContent className="sm:max-w-[425px] whitespace-pre-wrap">
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="exams.ready.assign" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage id="exams.ready.assignDescription" />
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <div className="grid grid-cols-2 items-center gap-4">
                        <FormLabel htmlFor="classId" className="text-right">
                          <FormattedMessage id="exams.ready.selectClassroom.class" />
                        </FormLabel>
                        <FormControl>
                          <SelectTrigger className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0">
                            <SelectValue
                              placeholder={t.formatMessage({
                                id: 'common.select',
                              })}
                            />
                          </SelectTrigger>
                        </FormControl>
                      </div>
                      <SelectContent>
                        {Object.keys(classroomByDivision)
                          .map(division => Number(division))
                          .sort()
                          .map(division => (
                            <SelectGroup key={division}>
                              <SelectLabel>
                                <FormattedMessage
                                  id={`common.divisions.${division}`}
                                />
                              </SelectLabel>
                              {classroomByDivision[division].map(
                                ({ id, schoolName, classroomName }) => (
                                  <SelectItem value={id} key={id}>
                                    {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
                                    {schoolName} - {classroomName}
                                  </SelectItem>
                                ),
                              )}
                            </SelectGroup>
                          ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <div className="grid grid-cols-2 items-center gap-4">
                      <FormLabel htmlFor="date" className="text-right">
                        <FormattedMessage id="exams.ready.selectClassroom.date" />
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn('pl-3 text-left font-normal')}
                            >
                              {format(field.value, 'PPP', { locale: fr })}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            locale={fr}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button onClick={() => console.log('save')}>
                <FormattedMessage id="exams.ready.distribute" />
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Form>
    </Dialog>
  );
};
