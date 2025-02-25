import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { ClassroomExams as Exams } from '~/components/Classrooms/ClassroomExams';
import {
  CLASSROOM_CREATE_DOM_NODE_ID,
  trpc,
  useBreadcrumb,
  useUserOrganizations,
} from '~/lib';

export const ClassroomExams = (): ReactElement => {
  const { classroomId } = useParams() as { classroomId: string };
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroom, isLoading } = trpc.classroomGet.useQuery({
    classroomId,
    organizationId: selectedOrganization.id,
  });

  const ref = useRef<HTMLDivElement | null>(null);
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    if (classroom === undefined) {
      setBreadcrumb([]);

      return;
    }

    setBreadcrumb([
      { label: `${classroom.schoolPseudo} - ${classroom.classroomName}` },
    ]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom]);

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classroom === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Examens assignés à la classe</div>
        <div id={CLASSROOM_CREATE_DOM_NODE_ID} ref={ref} />
      </div>
      <Exams classroomId={classroomId} />
    </div>
  );
};
