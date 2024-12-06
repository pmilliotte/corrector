import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ExamStatus } from '@corrector/shared';

import { trpc, useUserOrganizations } from '~/lib';

import { Button } from '../ui';
import { ExamAnalysis } from './ExamAnalysis';

type ExamMarksProps = {
  examId: string;
  status: ExamStatus;
};

export const ExamMarks = ({ examId, status }: ExamMarksProps): ReactElement => {
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { data, isLoading } = trpc.examSubjectAnalysisGet.useQuery(
    { id: examId, organizationId: selectedOrganization.id },
    { enabled: !['subject', 'imagesUploaded'].includes(status) },
  );
  const { mutate, isPending } = trpc.examSubjectAnalyze.useMutation({
    onSuccess: async () => {
      await utils.examSubjectAnalysisGet.invalidate();
    },
  });

  void utils.examGet.invalidate();

  if (status === 'subject') {
    return (
      <div className="h-full flex items-center justify-around text-muted-foreground">
        <FormattedMessage id="exams.marks.upload" />
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (status === 'imagesUploaded' && data === undefined) {
    return (
      <div className="h-full flex items-center justify-around">
        <Button
          className="flex gap-2"
          onClick={() =>
            mutate({
              id: examId,
              organizationId: selectedOrganization.id,
            })
          }
        >
          <FormattedMessage id="exams.marks.analyze" />
          {isPending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <ArrowRight size={16} />
          )}
        </Button>
      </div>
    );
  }
  if (data === undefined) {
    return (
      <div className="h-full flex items-center justify-around text-muted-foreground">
        <FormattedMessage id="exams.marks.noData" />
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-around">
      <ExamAnalysis analysis={data} examId={examId} />
    </div>
  );
};
