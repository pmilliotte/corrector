import { Loader2, TriangleAlert } from 'lucide-react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { ClassroomExams } from '~/components/Classrooms/ClassroomExams';
import { Students } from '~/components/Classrooms/Students';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui';
import {
  CLASSROOM_CREATE_DOM_NODE_ID,
  trpc,
  useBreadcrumb,
  useUserOrganizations,
} from '~/lib';

const TABS = ['students', 'exams'];

export const ClassroomWrapper = (): ReactElement => {
  const { classroomId } = useParams() as { classroomId: string };
  const [tabValue, setTabValue] = useState<'students' | 'exams'>('exams');
  const { selectedOrganization } = useUserOrganizations();
  const { data: classroom, isLoading } = trpc.classroomGet.useQuery({
    classroomId,
    organizationId: selectedOrganization.id,
  });
  const createRef = useRef<HTMLDivElement | null>(null);

  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    if (classroom === undefined) {
      setBreadcrumb([]);

      return;
    }

    setBreadcrumb([
      { label: `${classroom.schoolName} - ${classroom.classroomName}` },
    ]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classroom]);

  if (isLoading) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <Loader2 className="animate-spin" />
      </div>
    );
  }
  if (classroom === undefined) {
    return (
      <div className="p-4 h-full flex items-center justify-around">
        <TriangleAlert />
      </div>
    );
  }

  return (
    <div className="p-4 w-full h-full flex flex-col gap-2">
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
          <ClassroomExams classroomId={classroomId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
