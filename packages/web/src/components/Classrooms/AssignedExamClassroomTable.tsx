import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { ClassroomExam } from '@corrector/functions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';
import { AppRoute } from '~/lib';

type ReducedClassroom = Pick<
  ClassroomExam,
  'classroomId' | 'classroomName' | 'schoolYear' | 'schoolPseudo' | 'examDate'
>;

type AssignedExamClassroomTableProps = {
  classrooms: ReducedClassroom[];
  examId: string;
};

export const AssignedExamClassroomTable = ({
  classrooms,
  examId,
}: AssignedExamClassroomTableProps): ReactElement => {
  const navigate = useNavigate();
  const columns = [
    {
      id: 'schoolPseudo',
      header: () => 'Établissement',
      cell: (classroom: ReducedClassroom) => classroom.schoolPseudo,
    },

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
      id: 'examDate',
      header: () => 'Date',
      cell: (classroom: ReducedClassroom) =>
        new Date(classroom.examDate).toLocaleDateString('fr-FR'),
    },
  ];

  return (
    <div className="rounded-md border w-full">
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
                key={classroom.classroomId}
                className="hover:cursor-pointer"
                onClick={() =>
                  navigate(
                    `${AppRoute.Classrooms}/${classroom.classroomId}/exams/${examId}`,
                  )
                }
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
