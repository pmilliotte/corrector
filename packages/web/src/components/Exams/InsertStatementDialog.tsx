import { zodResolver } from '@hookform/resolvers/zod';
import { BetweenHorizonalEnd, Loader2, Save } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { trpc, useIntl } from '~/lib';

import {
  Button,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '../ui';

export type ProblemContent =
  | { type: 'statement'; text: string; id: string }
  | { type: 'question'; text: string; index: number; id: string };

type InsertStatementDialogProps = {
  position: number;
  examId: string;
  problemId: string;
};

const formSchema = z.object({
  type: z.enum(['statement', 'question']),
  text: z.string().min(1),
});

export const InsertStatementDialog = ({
  position,
  examId,
  problemId,
}: InsertStatementDialogProps): ReactElement => {
  const utils = trpc.useUtils();
  const t = useIntl();
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: undefined,
      text: '',
    },
  });
  const { mutate, isPending } = trpc.examStatementInsert.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
      form.reset();
      setOpen(false);
    },
  });
  const onSubmit = ({ type, text }: z.infer<typeof formSchema>) => {
    mutate({
      type,
      text,
      position,
      examId,
      problemId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <BetweenHorizonalEnd size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="exams.problem.statement.add.title" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage id="exams.problem.statement.add.description" />
              </DialogDescription>
            </DialogHeader>
            <div className="my-2 flex flex-col gap-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger
                          id="type"
                          className="whitespace-normal [&>span]:text-left [&>svg]:shrink-0"
                        >
                          <SelectValue
                            placeholder={t.formatMessage({
                              id: 'exams.problem.statement.add.select',
                            })}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="max-w-[var(--radix-select-trigger-width)] overflow-y-auto max-h-[12rem]"
                      >
                        {['statement', 'question'].map(type => (
                          <SelectItem
                            value={type}
                            key={type}
                            className="max-w-100"
                          >
                            <FormattedMessage
                              id={`exams.problem.statement.type.${type}`}
                            />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="">
                    <FormControl>
                      <Textarea className="mt-0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="flex items-center gap-2">
                {isPending ? (
                  <Loader2 size={16} className="animate-spin" />
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
