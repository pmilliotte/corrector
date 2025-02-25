import { Plus } from 'lucide-react';
import { ReactElement, useState } from 'react';
import { z } from 'zod';

import { Button, Dialog, DialogContent, DialogTrigger } from '~/components/ui';

import { createSchoolFormSchema } from './constants';
import { CreateSchoolForm } from './CreateSchoolForm';
import { SearchSchoolInput } from './SearchSchoolInput';

export const CreateSchoolDialog = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [searchInputFormValues, setSearchInputFormValues] =
    useState<z.infer<typeof createSchoolFormSchema>>();
  const [search, setSearch] = useState<string>('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1" variant="outline">
          <Plus size={16} />
          <span>Créer un établissement</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <div className="text-md font-semibold">Rechercher un établissement</div>
        <SearchSchoolInput
          setFormValues={setSearchInputFormValues}
          formValues={searchInputFormValues}
          search={search}
          setSearch={setSearch}
        />
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">ou</span>
          </div>
        </div>
        <div className="text-md font-semibold">Créer un établissement</div>
        <CreateSchoolForm
          searchInputValues={searchInputFormValues}
          resetSearch={() => {
            setSearch('');
            setSearchInputFormValues(undefined);
          }}
          setOpen={setOpen}
        />
      </DialogContent>
    </Dialog>
  );
};
