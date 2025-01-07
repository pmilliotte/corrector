import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { CreateStudentDialog } from '~/components/Classrooms/CreateStudentDialog';
import { StudentTable } from '~/components/Classrooms/StudentTable';
import { Separator } from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

export const ClassroomWrapper = (): ReactElement => {
  const { classroomId } = useParams() as { classroomId: string };
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroomData, isLoading: classroomLoading } =
    trpc.classroomGet.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
    });
  const { data: studentsData, isLoading: studentsLoading } =
    trpc.classroomStudentList.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
    });

  if (classroomLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classroomData === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  const { classroomName, created, schoolName } = classroomData.classroom;

  return (
    <div className="p-4 w-full h-full flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
          {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
          {`${schoolName} - ${classroomName}`}
        </span>
        <div className="text-muted-foreground text-sm whitespace-nowrap shrink-0">
          <FormattedMessage
            id="classrooms.createdOn"
            values={{
              date: new Date(created).toLocaleDateString('fr'),
            }}
          />
        </div>
      </div>
      <Separator />
      <div className="grow flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="font-semibold">
            <FormattedMessage id="classrooms.students" />
          </div>
          {studentsData !== undefined && (
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
            />
          )}
        </div>
        {studentsLoading ? (
          <div className="h-full flex items-center justify-around">
            <Loader2 className="animate-spin" />
          </div>
        ) : studentsData === undefined ? (
          <TriangleAlert />
        ) : (
          <StudentTable students={studentsData.students} />
        )}
      </div>
    </div>
  );
};
