import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { ClassroomExam } from '@corrector/functions';

import { AppRoute } from '~/lib';

import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui';

type ClassroomExamTableProps = {
  classroomExams: ClassroomExam[];
};

export const ClassroomExamTable = ({
  classroomExams,
}: ClassroomExamTableProps): ReactElement => {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'name',
      header: () => <FormattedMessage id="exams.name" />,
      cell: (exam: ClassroomExam) => exam.name,
    },
    {
      id: 'examDate',
      header: () => <FormattedMessage id="classroomExam.date" />,
      cell: (exam: ClassroomExam) =>
        new Date(exam.examDate).toISOString().slice(0, 10),
    },
    {
      id: 'subject',
      header: () => <FormattedMessage id="exams.subject" />,
      cell: (exam: ClassroomExam) => (
        <Badge
          variant="secondary"
          className="whitespace-nowrap border-solid border-4 cursor-pointer"
        >
          <FormattedMessage id={`common.subjects.${exam.subject}`} />
        </Badge>
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
          {classroomExams.length > 0 ? (
            classroomExams.map(exam => (
              <TableRow
                onClick={() =>
                  navigate(
                    `${AppRoute.Classrooms}/${exam.classroomId}/${AppRoute.Exams}/${exam.examId}`,
                  )
                }
                className="hover:cursor-pointer"
                key={exam.examId}
              >
                {columns.map(column => (
                  <TableCell key={column.id}>{column.cell(exam)}</TableCell>
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
