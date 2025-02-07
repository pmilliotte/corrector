import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';

import { trpc, useUserOrganizations } from '~/lib';

import { ClassroomExamAnswerTable } from './ClassroomAnswerTable';

type ClassroomExamAnswersProps = {
  classroomId: string;
  examId: string;
};

export const ClassroomExamAnswers = ({
  classroomId,
  examId,
}: ClassroomExamAnswersProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroomExamAnswersData, isLoading: answersLoading } =
    trpc.classroomExamAnswerList.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
      examId,
    });

  if (answersLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classroomExamAnswersData === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <ClassroomExamAnswerTable
      classroomExamAnswers={classroomExamAnswersData.classroomExamAnswers}
    />
  );
};
