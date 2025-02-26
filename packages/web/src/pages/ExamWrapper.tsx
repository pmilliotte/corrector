import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { ExamConfigureProblems } from '~/components/Exams/ExamConfigureProblems';
import { ExamReady } from '~/components/Exams/ExamReady';
import { ExamUploadFiles } from '~/components/Exams/ExamUploadFiles';
import { ExamUploadSubject } from '~/components/Exams/ExamUploadSubject';
import { UploadSelect } from '~/components/Exams/UploadSelect';
import { AppRoute, trpc, useBreadcrumb } from '~/lib';

export const ExamWrapper = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const { data: exam, isLoading } = trpc.examGet.useQuery({
    id: examId,
  });

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    if (exam === undefined) {
      setBreadcrumb([]);

      return;
    }

    setBreadcrumb([
      { label: 'Examens', linkTo: AppRoute.Exams },
      { label: exam.name },
    ]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam]);

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (exam === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  const { status, problems } = exam;

  const ExamContent = () => {
    switch (status) {
      case 'created':
        return <UploadSelect exam={exam} />;
      case 'uploadFiles':
      case 'configureProblemsRequested':
        return <ExamUploadFiles exam={exam} />;
      case 'uploadSubject':
        return <ExamUploadSubject exam={exam} />;
      case 'configureProblems':
        return (
          // @ts-ignore Type instantiation is excessively deep and possibly infinite
          <ExamConfigureProblems
            examId={examId}
            problems={problems.configureProblems}
          />
        );
      case 'ready':
        return <ExamReady examId={examId} />;
      default:
        return <></>;
    }
  };

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <div className="w-full h-full">
        <ExamContent />
      </div>
    </div>
  );
};
