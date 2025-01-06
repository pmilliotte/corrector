import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ClassroomTable, CreateClassroomDialog } from '~/components/Classrooms';
import { trpc, useSession, useUserOrganizations } from '~/lib';

export const Classrooms = (): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classrooms, isLoading } = trpc.classroomList.useQuery({
    organizationId: selectedOrganization.id,
    userId,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classrooms === undefined) {
    return (
      <div className="h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <FormattedMessage id="classrooms.title" />
        </div>
        <CreateClassroomDialog />
      </div>
      <ClassroomTable classrooms={classrooms} />
    </div>
  );
};
