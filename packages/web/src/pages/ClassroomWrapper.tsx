import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { Students } from '~/components/Classrooms/Students';
import {
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui';
import {
  CLASSROOM_CREATE_DOM_NODE_ID,
  trpc,
  useUserOrganizations,
} from '~/lib';

const TABS = ['students', 'exams'];

export const ClassroomWrapper = (): ReactElement => {
  const { classroomId } = useParams() as { classroomId: string };
  const [tabValue, setTabValue] = useState<'students' | 'exams'>('students');
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroomData, isLoading: classroomLoading } =
    trpc.classroomGet.useQuery({
      classroomId,
      organizationId: selectedOrganization.id,
    });
  const createRef = useRef<HTMLDivElement | null>(null);

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
      <Tabs
        defaultValue={tabValue}
        // @ts-expect-error tab values are defined
        onValueChange={setTabValue}
        className="flex flex-col h-full"
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-2">
            {TABS.map(tab => (
              <TabsTrigger key={tab} value={tab} id={`exam.tabs.${tab}`}>
                <FormattedMessage id={`classrooms.tabs.${tab}`} />
              </TabsTrigger>
            ))}
          </TabsList>
          <div id={CLASSROOM_CREATE_DOM_NODE_ID} ref={createRef} />
        </div>
        <TabsContent value="students" className="h-full">
          <Students classroomId={classroomId} />
        </TabsContent>
        <TabsContent value="exams" className="h-full">
          <></>
        </TabsContent>
      </Tabs>
    </div>
  );
};
