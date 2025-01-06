import { ArrowUpDown } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import { Subject } from '@corrector/shared';

import {
  Badge,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';
import { AppRoute } from '~/lib';

type Exam = {
  id: string;
  name: string;
  created: string;
  subject: Subject;
};

type Sorting = 'asc' | 'desc';

export const DataTable = ({ exams }: { exams: Exam[] }): ReactElement => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<Sorting>('asc');
  const [sortedExams, setSortedExams] = useState(exams);

  useEffect(() => {
    if (sorting === 'asc') {
      setSortedExams(exams.sort((a, b) => a.created.localeCompare(b.created)));
    }
    if (sorting === 'desc') {
      setSortedExams(exams.sort((a, b) => b.created.localeCompare(a.created)));
    }
  }, [sortedExams, sorting, exams]);

  const columns = [
    {
      id: 'name',
      header: () => <FormattedMessage id="exams.name" />,
      cell: (exam: Exam) => exam.name,
    },
    {
      id: 'created',
      header: () => (
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() =>
            setSorting(prevSorting => (prevSorting === 'asc' ? 'desc' : 'asc'))
          }
        >
          <FormattedMessage id="exams.created" />
          <ArrowUpDown size={16} />
        </Button>
      ),
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
          {sortedExams.length > 0 ? (
            sortedExams.map(exam => (
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
