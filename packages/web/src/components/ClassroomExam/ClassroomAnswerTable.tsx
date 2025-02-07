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

type ClassroomExamAnswer = {
  firstName?: string;
  lastName?: string;
  status: string;
  userId: string;
};
type ClassroomExamAnswerTableProps = {
  classroomExamAnswers: ClassroomExamAnswer[];
};

export const ClassroomExamAnswerTable = ({
  classroomExamAnswers,
}: ClassroomExamAnswerTableProps): ReactElement => {
  const columns = [
    {
      id: 'firstName',
      header: () => <FormattedMessage id="common.firstName" />,
      cell: (classroomExamAnswer: ClassroomExamAnswer) =>
        classroomExamAnswer.firstName,
    },
    {
      id: 'lastName',
      header: () => <FormattedMessage id="common.lastName" />,
      cell: (classroomExamAnswer: ClassroomExamAnswer) =>
        classroomExamAnswer.lastName,
    },
    {
      id: 'status',
      header: () => 'Statut',
      cell: (classroomExamAnswer: ClassroomExamAnswer) =>
        classroomExamAnswer.status,
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
          {classroomExamAnswers.length > 0 ? (
            classroomExamAnswers.map(classroomExamAnswer => (
              <TableRow key={classroomExamAnswer.userId}>
                {columns.map(column => (
                  <TableCell key={column.id}>
                    {column.cell(classroomExamAnswer)}
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
