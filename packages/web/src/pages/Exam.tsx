import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { ExamFiles } from '~/components/Exams/ExamFiles';
import { ExamMarks } from '~/components/Exams/ExamMarks';
import {
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

export const Exam = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const { selectedOrganization } = useUserOrganizations();

  const { data: exam } = trpc.examGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  const { data: fileNames } = trpc.examFilesGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  return exam === undefined ? (
    <></>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="font-semibold text-xl">
          <FormattedMessage id={`common.subjects.${exam.exam.subject}`} /> -{' '}
          {exam.exam.name}
        </div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage
            id="exams.createdOn"
            values={{
              date: new Date(exam.exam.created).toLocaleString().slice(0, 10),
            }}
          />
        </div>
      </div>
      <Separator />
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="files" className="flex-auto">
            <FormattedMessage id="exams.tabs.files" />
          </TabsTrigger>
          <TabsTrigger value="marks" className="flex-auto">
            <FormattedMessage id="exams.tabs.marks" />
          </TabsTrigger>
          <TabsTrigger value="correction" className="flex-auto">
            <FormattedMessage id="exams.tabs.correction" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="space-y-4">
          <ExamFiles examId={examId} fileNames={fileNames} />
        </TabsContent>
        <TabsContent value="marks" className="space-y-4">
          <ExamMarks examId={examId} fileNames={fileNames} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
