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

import { LoadingButton } from '../shared';

const formSchema = z.object({
  classId: z.string(),
  date: z.date(),
});

export const AssignExamForm = (): ReactElement => {
  const t = useIntl();
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classrooms } = trpc.classroomList.useQuery({
    organizationId: selectedOrganization.id,
    userId,
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = ({ classId, date }: z.infer<typeof formSchema>) => {
    console.log({ classId, date });
  };

  const classroomByDivision = groupBy(classrooms, 'division');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="text-lg font-semibold">
          <FormattedMessage id="exams.ready.assign" />
        </div>
        <p className="text-muted-foreground text-sm">
          <FormattedMessage id="exams.ready.assignDescription" />
        </p>
        <FormField
          control={form.control}
          name="classId"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormLabel htmlFor="classId">
                  <FormattedMessage id="exams.ready.selectClassroom.class" />
                </FormLabel>
                <FormControl>
                  <SelectTrigger className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0 w-[240px]">
                    <SelectValue
                      placeholder={t.formatMessage({
                        id: 'common.select',
                      })}
                      className="text-ellipsis"
                    />
                  </SelectTrigger>
                </FormControl>
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
              <FormLabel>
                <FormattedMessage id="exams.ready.selectClassroom.date" />
              </FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
                        !field.value && 'text-muted-foreground',
                      )}
                    >
                      {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions */}
                      {field.value ? (
                        format(field.value, 'PPP', { locale: fr })
                      ) : (
                        <FormattedMessage id="common.select" />
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={fr}
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        <LoadingButton
          onClick={() => console.log('save')}
          label={t.formatMessage({ id: 'exams.ready.distribute' })}
          loading={false}
          Icon={BookUser}
        >
          <FormattedMessage id="exams.ready.distribute" />
        </LoadingButton>
      </form>
    </Form>
  );
};
