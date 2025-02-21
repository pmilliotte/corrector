import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { Classroom } from '@corrector/functions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';
import { AppRoute } from '~/lib';

type ClassroomWithSchoolPseudo = Classroom & { schoolPseudo?: string };

type ClassroomTableProps = {
  classrooms: ClassroomWithSchoolPseudo[];
};

export const ClassroomTable = ({
  classrooms,
}: ClassroomTableProps): ReactElement => {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'schoolPseudo',
      header: () => <FormattedMessage id="classrooms.school" />,
      cell: (classroom: ClassroomWithSchoolPseudo) => classroom.schoolPseudo,
    },
    {
      id: 'classroomName',
      header: () => <FormattedMessage id="classrooms.class" />,
      cell: (classroom: ClassroomWithSchoolPseudo) => classroom.classroomName,
    },
    {
      id: 'division',
      header: () => <FormattedMessage id="common.level" />,
      cell: (classroom: ClassroomWithSchoolPseudo) => (
        <FormattedMessage id={`common.divisions.${classroom.division}`} />
      ),
    },
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="bg-secondary">
          <TableRow>
            {columns.map(column => (
              <TableHead key={column.id}>{column.header()}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {classrooms.length > 0 ? (
            classrooms.map(classroom => (
              <TableRow
                onClick={() =>
                  navigate(`${AppRoute.Classrooms}/${classroom.id}`)
                }
                className="hover:cursor-pointer"
                key={classroom.id}
              >
                {columns.map(column => (
                  <TableCell key={column.id}>
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
