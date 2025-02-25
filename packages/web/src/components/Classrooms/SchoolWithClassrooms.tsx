import { ReactElement } from 'react';

import { Division, SchoolYear } from '@corrector/shared';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui';
import { ClassroomTable } from './ClassroomTable';
import { CreateClassroomDialog } from './CreateClassroomDialog';

type SchoolWithClassroomsProps = {
  schoolWithClassrooms: {
    pseudo: string;
    name: string;
    city: string;
    id: string;
    classrooms: {
      classroomName: string;
      id: string;
      division: Division;
      schoolYear: SchoolYear;
    }[];
  };
};

export const SchoolWithClassrooms = ({
  schoolWithClassrooms,
}: SchoolWithClassroomsProps): ReactElement => (
  <Card>
    <CardHeader className="flex flex-row items-start justify-between space-y-0">
      <div>
        <CardTitle>{schoolWithClassrooms.pseudo}</CardTitle>
        <CardDescription>{schoolWithClassrooms.city}</CardDescription>
      </div>
      <CreateClassroomDialog schoolId={schoolWithClassrooms.id} />
    </CardHeader>
    {schoolWithClassrooms.classrooms.length === 0 ? (
      <></>
    ) : (
      <CardContent className="flex items-center justify-center">
        <ClassroomTable
          classrooms={schoolWithClassrooms.classrooms.sort((a, b) =>
            a.schoolYear.localeCompare(b.schoolYear),
          )}
        />
      </CardContent>
    )}
  </Card>
);
