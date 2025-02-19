import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RefreshCcw, Save } from 'lucide-react';
import { ReactElement, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { z } from 'zod';

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
} from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

import {
  createSchoolFormSchema,
  DEFAULT_CREATE_SCHOOL_FORM_VALUES,
} from './constants';

type CreateSchoolFormProps = {
  searchInputValues?: z.infer<typeof createSchoolFormSchema>;
  resetSearch: () => void;
  setOpen: (bool: boolean) => void;
};

export const CreateSchoolForm = ({
  searchInputValues,
  resetSearch,
  setOpen,
}: CreateSchoolFormProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const form = useForm<z.infer<typeof createSchoolFormSchema>>({
    resolver: zodResolver(createSchoolFormSchema),
    defaultValues: DEFAULT_CREATE_SCHOOL_FORM_VALUES,
  });
  const {
    reset,
    formState: { errors },
  } = form;
  const resetForm = useCallback(() => {
    resetSearch();
    reset();
  }, [reset, resetSearch]);
  const { mutate, isPending } = trpc.schoolCreate.useMutation({
    onSuccess: async () => {
      await utils.schoolList.invalidate();

      setOpen(false);
      resetForm();
    },
  });
  useEffect(() => {
    reset(searchInputValues ?? DEFAULT_CREATE_SCHOOL_FORM_VALUES);
  }, [searchInputValues, reset]);

  const onSubmit = ({
    name,
    uai,
    city,
  }: z.infer<typeof createSchoolFormSchema>) => {
    mutate({
      name,
      uai,
      organizationId: selectedOrganization.id,
      city,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid grid-cols-[min-content_1fr] gap-2 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                <FormLabel htmlFor="name" className="text-right">
                  <span>Nom</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-0"
                    {...field}
                    disabled={searchInputValues !== undefined}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            // disabled={searchInputValues !== undefined}
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="grid grid-cols-subgrid col-span-2 items-center space-y-0">
                <FormLabel htmlFor="city" className="text-right">
                  <span>Ville</span>
                </FormLabel>
                <FormControl>
                  <Input
                    className="mt-0"
                    {...field}
                    disabled={searchInputValues !== undefined}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <div className="flex items-center justify-between sm:space-x-2">
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex items-center gap-2"
            type="button"
          >
            <RefreshCcw size={16} />
            <span>Réinitialiser</span>
          </Button>
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
        </div>
      </form>
    </Form>
  );
};
