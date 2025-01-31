import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';

import { ClassroomExamTable } from '~/components/Classrooms/ClassroomExamTable';
import { trpc, useUserOrganizations } from '~/lib';

type ClassroomExamsProps = { classroomId: string };

export const ClassroomExams = ({
  classroomId,
}: ClassroomExamsProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroomExams, isLoading } = trpc.classroomExamList.useQuery({
    classroomId,
    organizationId: selectedOrganization.id,
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classroomExams === undefined) {
    return (
      <div className="h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return <ClassroomExamTable classroomExams={classroomExams} />;
};
