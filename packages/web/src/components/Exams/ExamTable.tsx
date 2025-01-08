import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { Exam } from '@corrector/functions';

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

type ExamTableProps = {
  exams: Exam[];
};

export const ExamTable = ({ exams }: ExamTableProps): ReactElement => {
  const navigate = useNavigate();

  const columns = [
    {
      id: 'name',
      header: () => <FormattedMessage id="exams.name" />,
      cell: (exam: Exam) => exam.name,
    },
    {
      id: 'created',
      header: () => <FormattedMessage id="exams.created" />,
      cell: (exam: Exam) => new Date(exam.created).toISOString().slice(0, 10),
    },
    {
      id: 'subject',
      header: () => <FormattedMessage id="exams.subject" />,
      cell: (exam: Exam) => (
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
          {exams.length > 0 ? (
            exams.map(exam => (
              <TableRow
                onClick={() => navigate(`${AppRoute.Exams}/${exam.id}`)}
                className="hover:cursor-pointer"
                key={exam.id}
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
