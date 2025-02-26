import { Loader2 } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { AssignedExamClassroomTable } from '~/components/Classrooms/AssignedExamClassroomTable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from '~/components/ui';
import { trpc, useBreadcrumb, useSession, useUserOrganizations } from '~/lib';

export const AssignedExams = (): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const { id: userId } = useSession();
  const { data: classroomsByExam, isLoading: classroomsByExamLoading } =
    trpc.classroomByExamList.useQuery({
      organizationId: selectedOrganization.id,
      userId,
    });
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: 'Examens assignés' }]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (classroomsByExamLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {classroomsByExam !== undefined && classroomsByExam.length === 0 ? (
        <div className="flex items-center justify-around h-full text-muted-foreground text-sm">
          Aucun examen assigné
        </div>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {classroomsByExam?.map(
            ({ examId, examName, subject, classrooms }) => (
              <AccordionItem value={examId} key={examId}>
                <AccordionTrigger className="gap-4">
                  <div className="flex grow items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      {examName}
                      <div className="no-underline">
                        <Badge
                          variant="secondary"
                          className="whitespace-nowrap border-solid border-4"
                        >
                          <FormattedMessage id={`common.subjects.${subject}`} />
                        </Badge>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {new Date(classrooms[0].examDate).toLocaleDateString(
                        'fr-FR',
                        {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <AssignedExamClassroomTable
                    classrooms={classrooms}
                    examId={examId}
                  />
                </AccordionContent>
              </AccordionItem>
            ),
          )}
        </Accordion>
      )}
    </div>
  );
};
