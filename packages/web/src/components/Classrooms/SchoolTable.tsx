import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { School } from '@corrector/functions';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui';

type SchoolTableProps = {
  schools: School[];
};

export const SchoolTable = ({ schools }: SchoolTableProps): ReactElement => {
  const columns = [
    {
      id: 'name',
      header: () => 'Nom',
      cell: (school: School) => school.name,
    },
    {
      id: 'city',
      header: () => 'Ville',
      cell: (school: School) => school.city,
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
          {schools.length > 0 ? (
            schools.map(school => (
              <TableRow key={school.id}>
                {columns.map(column => (
                  <TableCell key={column.id}>{column.cell(school)}</TableCell>
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
