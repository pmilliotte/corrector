import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { SchoolForm } from '~/components/Classrooms/SchoolForm';
import { AppRoute, trpc, useBreadcrumb, useUserOrganizations } from '~/lib';

export const School = (): ReactElement => {
  const { schoolId } = useParams() as { schoolId: string };
  const { selectedOrganization } = useUserOrganizations();
  const { data: school, isLoading } = trpc.schoolGet.useQuery({
    schoolId,
    organizationId: selectedOrganization.id,
  });

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    if (school === undefined) {
      setBreadcrumb([]);

      return;
    }

    setBreadcrumb([
      { label: 'Établissements', linkTo: AppRoute.Classrooms },
      { label: school.pseudo },
    ]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [school]);

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (school === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{school.name}</div>
          <p className="text-muted-foreground text-sm">
            Certaines modifications ne seront pas prises en compte dans les
            examens déjà assignés
          </p>
        </div>
      </div>
      <div className="flex items-center justify-around h-full">
        <SchoolForm
          schoolId={schoolId}
          schoolPseudo={school.pseudo}
          schoolName={school.name}
        />
      </div>
    </div>
  );
};
