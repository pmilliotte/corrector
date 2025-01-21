import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Pencil, Save } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import { MAX_NUMBER_OF_LINES, MIN_NUMBER_OF_LINES } from '@corrector/shared';

import { trpc } from '~/lib';

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
  FormLabel,
  Input,
  Textarea,
} from '../ui';

export type ProblemContent =
  | { type: 'statement'; text: string; id: string }
  | {
      type: 'question';
      text: string;
      id: string;
      index: number;
      numberOfLines: number;
    };

type UpdateStatementDialogProps = {
  statement: ProblemContent;
  examId: string;
  problemId: string;
};

const formSchema = z.object({
  text: z.string().min(1),
  numberOfLines: z.coerce
    .number()
    .min(MIN_NUMBER_OF_LINES)
    .max(MAX_NUMBER_OF_LINES)
    .optional(),
});

export const UpdateStatementDialog = ({
  statement,
  examId,
  problemId,
}: UpdateStatementDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: statement.text,
      numberOfLines:
        statement.type === 'question' ? statement.numberOfLines : undefined,
    },
  });
  const { mutate, isPending } = trpc.examStatementUpdate.useMutation({
    onSuccess: async () => {
      await utils.examGet.invalidate();
      form.reset();
      setOpen(false);
    },
  });

  const onSubmit = ({ text, numberOfLines }: z.infer<typeof formSchema>) => {
    mutate({
      text,
      numberOfLines,
      examId,
      problemId,
      statementId: statement.id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Pencil size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="exams.problem.statement.modify.title" />
              </DialogTitle>
              <DialogDescription>
                <FormattedMessage id="exams.problem.statement.modify.description" />
              </DialogDescription>
            </DialogHeader>
            <div className="my-2 flex flex-col gap-2">
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
              {statement.type === 'question' && (
                <FormField
                  control={form.control}
                  name="numberOfLines"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2 space-y-0">
                      <FormLabel
                        htmlFor="numberOfLines"
                        className="text-right grow whitespace-nowrap"
                      >
                        <FormattedMessage id="exams.problem.statement.numberOfLinesLabel" />
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          max={MAX_NUMBER_OF_LINES}
                          min={MIN_NUMBER_OF_LINES}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
            <DialogFooter>
              <Button className="flex items-center gap-2" type="submit">
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
