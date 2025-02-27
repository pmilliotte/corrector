import { Loader2, RefreshCcw, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';

import { trpc, useUserOrganizations } from '~/lib';

import { Button } from '../ui';
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
  const utils = trpc.useUtils();
  const { data: classroomExamAnswersData, isLoading: answersLoading } =
    trpc.classroomExamAnswerList.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
      examId,
    });
  const { mutate, isPending } = trpc.classroomExamAnswerRefresh.useMutation({
    onSuccess: async () => {
      await utils.classroomExamAnswerList.invalidate();
    },
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
    <>
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          onClick={() =>
            mutate({
              examId,
              organizationId: selectedOrganization.id,
              classroomId,
            })
          }
        >
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <RefreshCcw size={16} />
          )}
        </Button>
        <div className="font-semibold">
          Nombre d&lsquo;élèves :{' '}
          {classroomExamAnswersData.classroomExamAnswers.length}
        </div>
      </div>
      <ClassroomExamAnswerTable
        classroomExamAnswers={classroomExamAnswersData.classroomExamAnswers}
      />
    </>
  );
};
