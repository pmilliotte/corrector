import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useEffect } from 'react';

import { ClassroomTable, CreateClassroomDialog } from '~/components/Classrooms';
import { CreateSchoolDialog } from '~/components/Classrooms/CreateSchool/CreateSchoolDialog';
import { SchoolTable } from '~/components/Classrooms/SchoolTable';
import { Separator } from '~/components/ui';
import { trpc, useBreadcrumb, useSession, useUserOrganizations } from '~/lib';

export const Classrooms = (): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classrooms, isLoading: classroomsLoading } =
    trpc.classroomList.useQuery({
      organizationId: selectedOrganization.id,
      userId,
    });
  const { data: schools, isLoading: schoolsLoading } = trpc.schoolList.useQuery(
    {
      organizationId: selectedOrganization.id,
    },
  );
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: 'Liste des classes' }]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (classroomsLoading || schoolsLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classrooms === undefined || schools === undefined) {
    return (
      <div className="h-full flex items-center justify-around">
        <TriangleAlert />
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
        <SchoolTable schools={schools} />
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">Mes classes</div>
          <CreateClassroomDialog schools={schools} />
        </div>
        <ClassroomTable classrooms={classrooms} />
      </div>
    </div>
  );
};
