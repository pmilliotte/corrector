import { Loader2, Plus, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';

import { ClassroomExamTable } from '~/components/Classrooms/ClassroomExamTable';
import {
  AppRoute,
  CLASSROOM_CREATE_DOM_NODE_ID,
  trpc,
  useUserOrganizations,
} from '~/lib';

import { Button } from '../ui';

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

  const createStudentDomNode = document.getElementById(
    CLASSROOM_CREATE_DOM_NODE_ID,
  );

  return (
    <>
      <ClassroomExamTable classroomExams={classroomExams} />
      {createStudentDomNode !== null &&
        createPortal(
          <Button size="sm" variant="outline" asChild>
            <Link to={AppRoute.Exams} className="gap-1">
              <Plus size={16} />
              <span>Assigner un examen</span>
            </Link>
          </Button>,
          createStudentDomNode,
        )}
    </>
  );
};
