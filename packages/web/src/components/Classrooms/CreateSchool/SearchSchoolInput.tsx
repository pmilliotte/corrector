import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';
import { Loader2 } from 'lucide-react';
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useRef,
} from 'react';
import { z } from 'zod';

import { Command, CommandInput } from '../../ui';
import {
  createSchoolFormSchema,
  DATA_GOUV_API_URL,
  ITEMS_LIMIT,
  postalCodeFilter,
  SCHOOL_NATURE_FILTER,
  searchNameFilter,
} from './constants';

type SearchSchoolInputProps = {
  setFormValues: Dispatch<
    SetStateAction<z.infer<typeof createSchoolFormSchema> | undefined>
  >;
  formValues: z.infer<typeof createSchoolFormSchema> | undefined;
  setSearch: Dispatch<SetStateAction<string>>;
  search: string;
};

type SchoolResults = {
  results: {
    libelle_commune: string;
    appellation_officielle: string;
    code_postal_uai: string;
    numero_uai: string;
  }[];
};

const fetchGouvSchools = async ({ queryKey }: { queryKey: string[] }) => {
  const [_, searchFilter] = queryKey;
  const response = await fetch(
    `${DATA_GOUV_API_URL}?where=${SCHOOL_NATURE_FILTER}%20and%20(${searchNameFilter(searchFilter)}%20or%20${postalCodeFilter(searchFilter)})&limit=${ITEMS_LIMIT}`,
  );

  const data = (await response.json()) as unknown as SchoolResults;

  return data;
};

export const SearchSchoolInput = ({
  setFormValues,
  formValues,
  search,
  setSearch,
}: SearchSchoolInputProps): ReactElement => {
  useEffect(() => {
    formValues === undefined && setSearch('');
  }, [formValues, setSearch]);
  const { data, refetch, isLoading } = useQuery({
    queryKey: ['schools', search],
    queryFn: fetchGouvSchools,
    enabled: false,
    refetchOnMount: false,
  });
  const debounced = useRef(debounce(refetch, 1000));
  useEffect(() => {
    search !== '' && void debounced.current();
  }, [search]);

  const hasResults = data?.results !== undefined && data.results.length > 0;

  return (
    <Command className="rounded-md border shadow-none md:min-w-[450px] relative">
      <CommandInput
        placeholder="Rechercher par nom ou code postal"
        onValueChange={setSearch}
        value={search}
      />
      <div className="overflow-y-auto h-[150px] p-1 text-foreground [&>.group]:px-2 [&>.group]:py-1.5 [&>.group]:text-xs [&>.group]:font-medium [&>.group]:text-muted-foreground">
        {search === '' ? (
          <div className="flex items-center justify-center text-sm h-full w-full text-muted-foreground">
            Commencer une recherche...
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center text-sm h-full w-full">
            <Loader2 className="animate-spin" size={16} />
          </div>
        ) : hasResults ? (
          <>
            <div className="group">Suggestions</div>
            <div>
              {data.results
                .sort((a, b) =>
                  a.code_postal_uai.localeCompare(b.code_postal_uai),
                )
                .map(
                  ({
                    appellation_officielle,
                    code_postal_uai,
                    numero_uai,
                    libelle_commune,
                  }) => (
                    <button
                      className="w-full text-left relative flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                      key={numero_uai}
                      onClick={() => {
                        setFormValues({
                          name: appellation_officielle,
                          city: libelle_commune,
                          uai: numero_uai,
                          pseudo: appellation_officielle,
                        });
                        setSearch('');
                      }}
                    >
                      <span>
                        {code_postal_uai} - {appellation_officielle}
                      </span>
                    </button>
                  ),
                )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center text-sm h-full w-full text-muted-foreground">
            Aucun résultat
          </div>
        )}
      </div>
    </Command>
  );
};
