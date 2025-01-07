import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';

type Student = {
  firstName?: string;
  lastName?: string;
  identifier?: number;
  userId: string;
};
type StudentTableProps = {
  students: Student[];
};

export const StudentTable = ({ students }: StudentTableProps): ReactElement => {
  const columns = [
    {
      id: 'firstName',
      header: () => <FormattedMessage id="common.firstName" />,
      cell: (student: Student) => student.firstName,
    },
    {
      id: 'lastName',
      header: () => <FormattedMessage id="common.lastName" />,
      cell: (student: Student) => student.lastName,
    },
    {
      id: 'identifier',
      header: () => <FormattedMessage id="classrooms.studentIdentifier" />,
      cell: (student: Student) => student.identifier,
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
          {students.length > 0 ? (
            students.map(student => (
              <TableRow key={student.userId}>
                {columns.map(column => (
                  <TableCell key={column.id}>{column.cell(student)}</TableCell>
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
