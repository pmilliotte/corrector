import { FileText, Users } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import { Classroom } from '@corrector/functions';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';
import { AppRoute } from '~/lib';

type ReducedClassroom = Pick<
  Classroom,
  'id' | 'classroomName' | 'division' | 'schoolYear'
>;

type ClassroomTableProps = {
  classrooms: ReducedClassroom[];
};

export const ClassroomTable = ({
  classrooms,
}: ClassroomTableProps): ReactElement => {
  const columns = [
    {
      id: 'schoolYear',
      header: () => 'Année scolaire',
      cell: (classroom: ReducedClassroom) => classroom.schoolYear,
    },
    {
      id: 'classroomName',
      header: () => <FormattedMessage id="classrooms.class" />,
      cell: (classroom: ReducedClassroom) => classroom.classroomName,
    },
    {
      id: 'division',
      header: () => <FormattedMessage id="common.level" />,
      cell: (classroom: ReducedClassroom) => (
        <FormattedMessage id={`common.divisions.${classroom.division}`} />
      ),
    },
    {
      id: 'actions',
      header: () => null,
      cell: (classroom: ReducedClassroom) => (
        <div className="flex items-center gap-1 justify-end">
          <Button size="icon" variant="outline" asChild>
            <Link to={`${AppRoute.Classrooms}/${classroom.id}/users`}>
              <Users size={16} />
            </Link>
          </Button>
          <Button size="icon" variant="outline" asChild>
            <Link to={`${AppRoute.Classrooms}/${classroom.id}/exams`}>
              <FileText size={16} />
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-md border w-full">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            {columns.map(column => (
              <TableHead
                key={column.id}
                className={column.id === 'actions' ? 'text-right' : ''}
              >
                {column.header()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {classrooms.length > 0 ? (
            classrooms.map(classroom => (
              <TableRow key={classroom.id}>
                {columns.map(column => (
                  <TableCell
                    key={column.id}
                    className={column.id === 'actions' ? 'text-right' : ''}
                  >
                    {column.cell(classroom)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <FormattedMessage id="common.noResults" />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
