import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Save } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '~/components/ui';
import { trpc, useIntl, useUserOrganizations } from '~/lib';

import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui';

const formSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  identifier: z.coerce.number(),
});

type CreateStudentDialogProps = { classroomId: string; maxIdentifier: number };

export const CreateStudentDialog = ({
  classroomId,
  maxIdentifier,
}: CreateStudentDialogProps): ReactElement => {
  const [open, setOpen] = useState(false);
  const t = useIntl();
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.studentCreate.useMutation({
    onSuccess: async () => {
      await utils.classroomStudentList.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast(t.formatMessage({ id: 'classrooms.createStudentError.title' }), {
        description: t.formatMessage({
          id: 'classrooms.createStudentError.description',
        }),
        action: {
          label: t.formatMessage({ id: 'common.close' }),
          onClick: () => {},
        },
      });
    },
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      identifier: maxIdentifier + 1,
    },
  });

  const onSubmit = ({
    firstName,
    lastName,
    identifier,
  }: z.infer<typeof formSchema>) => {
    mutate({
      firstName,
      lastName,
      identifier,
      classroomId,
      organizationId: selectedOrganization.id,
    });
  };

  const {
    formState: { errors },
  } = form;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus size={16} />
          <FormattedMessage id="classrooms.studentCreate" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <FormattedMessage id="classrooms.studentCreate" />
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-[min-content_1fr] gap-4 py-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                    <FormLabel htmlFor="firstName" className="text-right">
                      <FormattedMessage id="common.firstName" />
                    </FormLabel>
                    <FormControl>
                      <Input className="mt-0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                    <FormLabel htmlFor="lastName" className="text-right">
                      <FormattedMessage id="common.lastName" />
                    </FormLabel>
                    <FormControl>
                      <Input className="mt-0" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                    <FormLabel htmlFor="identifier" className="text-right">
                      <FormattedMessage id="classrooms.studentIdentifier" />
                    </FormLabel>
                    <FormControl>
                      <Input className="mt-0" type="number" {...field} />
                    </FormControl>
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
