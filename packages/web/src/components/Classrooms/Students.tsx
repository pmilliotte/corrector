import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { createPortal } from 'react-dom';

import {
  CLASSROOM_CREATE_DOM_NODE_ID,
  trpc,
  useUserOrganizations,
} from '~/lib';

import { CreateStudentDialog } from './CreateStudentDialog';
import { StudentTable } from './StudentTable';

type StudentsProps = {
  classroomId: string;
};

export const Students = ({ classroomId }: StudentsProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { data: studentsData, isLoading: studentsLoading } =
    trpc.classroomStudentList.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
    });

  if (studentsLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (studentsData === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  const createStudentDomNode = document.getElementById(
    CLASSROOM_CREATE_DOM_NODE_ID,
  );

  return (
    <>
      <StudentTable students={studentsData.students} />
      {createStudentDomNode !== null &&
        createPortal(
          <CreateStudentDialog
            classroomId={classroomId}
            maxIdentifier={
              studentsData.students.length === 0
                ? 0
                : Math.max(
                    ...studentsData.students.map(
                      ({ identifier }) => identifier ?? 0,
                    ),
                  )
            }
          />,
          createStudentDomNode,
        )}
    </>
  );
};
