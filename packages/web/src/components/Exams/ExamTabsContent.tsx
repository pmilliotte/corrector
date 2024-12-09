import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { ExamStatus } from '@corrector/shared';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui';

import { ExamMarks } from './ExamMarks';
import { Subject } from './Subject';

type ExamTabsContentProps = { status: ExamStatus; id: string };

const TABS = ['subject', 'marks', 'responses', 'correction'];

const DEFAULT_TAB = {
  subject: 'subject',
  imagesUploaded: 'subject',
  marks: 'marks',
  responses: 'responses',
  correction: 'correction',
};

export const ExamTabsContent = ({
  status,
  id,
}: ExamTabsContentProps): ReactElement => (
  <Tabs
    defaultValue={DEFAULT_TAB[status]}
    className="h-full flex flex-col gap-2"
  >
    <div className="flex items-center">
      <TabsList className="grid w-full grid-cols-4">
        {TABS.map(tab => (
          <TabsTrigger key={tab} value={tab} id={`exam.tabs.${tab}`}>
            <FormattedMessage id={`exams.tabs.${tab}`} />
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
    <TabsContent
      value="subject"
      className="m-0 grow min-h-0 overflow-hidden hover:overflow-y-auto"
    >
      <Subject examId={id} />
    </TabsContent>
    <TabsContent
      value="marks"
      className="m-0 grow min-h-0 overflow-hidden hover:overflow-y-auto"
    >
      <ExamMarks examId={id} status={status} />
    </TabsContent>
  </Tabs>
);
