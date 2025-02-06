import { ReactElement, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { AppRoute, trpc, useBreadcrumb, useUserOrganizations } from '~/lib';

export const ClassroomExam = (): ReactElement => {
  const { classroomId, examId } = useParams() as {
    classroomId: string;
    examId: string;
  };
  const { selectedOrganization } = useUserOrganizations();

  const { data: classroomExam } = trpc.classroomExamGet.useQuery({
    examId,
    classroomId,
    organizationId: selectedOrganization.id,
  });

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    if (classroomExam === undefined) {
      setBreadcrumb([]);

      return;
    }

    setBreadcrumb([
      {
        label: `${classroomExam.schoolName} - ${classroomExam.classroomName}`,
        linkTo: `${AppRoute.Classrooms}/${classroomExam.classroomId}`,
      },
      { label: classroomExam.examName },
    ]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroomExam]);

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <FormattedMessage id="classroomExam.title" />
        </div>
        {classroomId} - {examId}
      </div>
    </div>
  );
};
