import { Loader2 } from 'lucide-react';
import { ReactElement, useEffect } from 'react';

import { CreateSchoolDialog } from '~/components/Classrooms/CreateSchool/CreateSchoolDialog';
import { SchoolWithClassrooms } from '~/components/Classrooms/SchoolWithClassrooms';
import { trpc, useBreadcrumb, useSession, useUserOrganizations } from '~/lib';

export const Classrooms = (): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classroomsBySchool, isLoading: classroomsBySchoolLoading } =
    trpc.classroomBySchoolList.useQuery({
      organizationId: selectedOrganization.id,
      userId,
    });
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: 'Liste des classes' }]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (classroomsBySchoolLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Mes établissements</div>
          <CreateSchoolDialog />
        </div>
        {classroomsBySchool
          ?.sort((a, b) => a.pseudo.localeCompare(b.pseudo))
          .map(schoolWithClassrooms => (
            <SchoolWithClassrooms
              key={schoolWithClassrooms.id}
              schoolWithClassrooms={schoolWithClassrooms}
            />
          ))}
      </div>
    </div>
  );
};
