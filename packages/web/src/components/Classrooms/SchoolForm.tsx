import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { ReactElement } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

import { LoadingButton } from '../shared';

type SchoolFormProps = {
  schoolPseudo: string;
  schoolId: string;
  schoolName: string;
};

const formSchema = z.object({
  pseudo: z.string(),
  name: z.string(),
});

export const SchoolForm = ({
  schoolId,
  schoolPseudo,
  schoolName,
}: SchoolFormProps): ReactElement => {
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.schoolUpdate.useMutation({
    onSuccess: async () => {
      await utils.schoolGet.invalidate();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pseudo: schoolPseudo,
      name: schoolName,
    },
  });

  const onSubmit = ({ pseudo }: z.infer<typeof formSchema>) => {
    mutate({
      pseudo,
      schoolId,
      organizationId: selectedOrganization.id,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="name">Nom</FormLabel>
              <FormControl className="min-w-[240px]">
                <Input {...field} disabled />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="pseudo"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel htmlFor="pseudo">Pseudo</FormLabel>
              <FormControl className="min-w-[240px]">
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            loading={isPending}
            label="Enregistrer"
            Icon={Save}
            iconPosition="left"
            disabled={isPending}
          />
        </div>
      </form>
    </Form>
  );
};
