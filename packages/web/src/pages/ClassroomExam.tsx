import { ExternalLink } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { ClassroomExamUploadAnswers } from '~/components/ClassroomExam/ClassroomExamUploadAnswers';
import { LoadingButton } from '~/components/shared';
import { AppRoute, trpc, useBreadcrumb, useUserOrganizations } from '~/lib';

export const ClassroomExam = (): ReactElement => {
  const { classroomId, examId } = useParams() as {
    classroomId: string;
    examId: string;
  };
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();

  const { mutate: generatePdf, isPending: generatePdfPending } =
    trpc.classroomExamGeneratePdf.useMutation({
      onSuccess: async () => {
        const data = await utils.pdfPresignedUrlGet.fetch({
          examId,
          entity: 'classroomExam',
          classroomId,
          organizationId: selectedOrganization.id,
          type: 'subject',
        });

        data.exists && window.open(data.url, '_blank', 'noopener,noreferrer');
      },
    });

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
        <LoadingButton
          Icon={ExternalLink}
          className="self-end flex gap-2"
          onClick={() =>
            generatePdf({
              examId,
              classroomId,
              organizationId: selectedOrganization.id,
            })
          }
          variant="outline"
          loading={generatePdfPending}
          label="Ouvrir les sujets"
        />
      </div>
      {classroomExam !== undefined && (
        <ClassroomExamUploadAnswers classroomExam={classroomExam} />
      )}
    </div>
  );
};
