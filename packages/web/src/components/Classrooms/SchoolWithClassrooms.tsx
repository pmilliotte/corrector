import { Settings } from 'lucide-react';
import { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Division, SchoolYear } from '@corrector/shared';

import {
  Button,
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
      <div className="flex items-center gap-1">
        <Button
          asChild
          className="flex items-center gap-2"
          size="sm"
          variant="outline"
        >
          <Link to={`/schools/${schoolWithClassrooms.id}`}>
            <Settings size={16} />
            Modifier l&lsquo;établissement
          </Link>
        </Button>
        <CreateClassroomDialog schoolId={schoolWithClassrooms.id} />
      </div>
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
