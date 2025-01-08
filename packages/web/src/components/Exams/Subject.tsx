import { ArrowRight, Loader2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_BLANK, ExamStatus } from '@corrector/shared';

import { trpc, useUserOrganizations } from '~/lib';

import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { ExamAnalysis } from './ExamAnalysis';
import { FileActions } from './FileActions';

type SubjectProps = {
  examId: string;
  status: ExamStatus;
};

const TABS = ['marks', 'correction'];

const DEFAULT_TAB = {
  toBeUploaded: 'marks',
  fileUploaded: 'marks',
  imagesUploaded: 'marks',
  analyzed: 'marks',
  corrected: 'correction',
};

export const Subject = ({ examId, status }: SubjectProps): ReactElement => {
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { data, isLoading } = trpc.examSubjectAnalysisGet.useQuery(
    { id: examId, organizationId: selectedOrganization.id },
    {
      enabled: !['subject', 'imagesUploaded'].includes(status),
      refetchOnMount: false,
    },
  );
  const { mutate, isPending } = trpc.examSubjectAnalyze.useMutation({
    onSuccess: async () => {
      await utils.examSubjectAnalysisGet.invalidate();
      await utils.examGet.invalidate();
    },
  });

  const SubjectContent = () => {
    switch (true) {
      case isLoading:
        return (
          <div className="h-full flex items-center justify-around">
            <Loader2 className="animate-spin" />
          </div>
        );
      case status === 'imagesUploaded':
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
      case data === undefined:
        return (
          <div className="h-full flex items-center justify-around text-muted-foreground">
            <FormattedMessage id="exams.marks.noData" />
          </div>
        );
      default:
        return <ExamAnalysis examId={examId} analysis={data} />;
    }
  };

  return (
    <Tabs
      defaultValue={DEFAULT_TAB[status]}
      className="flex flex-col gap-4 h-full"
    >
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-2">
          {TABS.map(tab => (
            <TabsTrigger key={tab} value={tab} id={`exam.tabs.${tab}`}>
              <FormattedMessage id={`exams.tabs.${tab}`} />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center">
          <FileActions
            examId={examId}
            fileType={EXAM_BLANK}
            file={{ id: 'subject', status }}
          />
        </div>
      </div>
      <TabsContent value="marks" className="grow">
        <SubjectContent />
      </TabsContent>
    </Tabs>
  );
};
