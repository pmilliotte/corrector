import { Save, Upload } from 'lucide-react';
import { ReactElement, useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  ScrollArea,
  ScrollBar,
} from '~/components/ui';

import { LoadingButton } from '../shared';
import { StudentTable } from './StudentTable';

const ACCEPTED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];

type StudentInfo = { Nom: string; ['Prénom']: string };

const capitalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(
      /(^|\s|-|')([a-z])/g,
      (_, boundary: string, letter: string) => boundary + letter.toUpperCase(),
    );

const hasStudentsFormat = (data: unknown[]): data is StudentInfo[] =>
  data.every(
    item =>
      item !== undefined &&
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Record<string, unknown>)['Nom'] === 'string' &&
      typeof (item as Record<string, unknown>)['Prénom'] === 'string',
  );

export const ImportStudentsDialog = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [students, setStudents] = useState<StudentInfo[]>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Open file dialog
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file === undefined || !ACCEPTED_FILE_TYPES.includes(file.type)) {
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target === null) {
        return;
      }
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const sheetData = XLSX.utils.sheet_to_json(sheet);

      if (!hasStudentsFormat(sheetData)) {
        return;
      }

      setStudents(sheetData);
      setOpen(true);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (!open) {
      setStudents(undefined);
    }
  }, [open, setStudents]);

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".xlsx,.csv"
        />
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={handleButtonClick}
        >
          <Upload size={16} />
          Importer la liste (.xlsx)
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-9/10">
          <DialogHeader>
            <DialogTitle>Liste des élèves</DialogTitle>
            <DialogDescription>
              Valider pour créer les {students?.length} élèves suivants :
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[300px]">
            <StudentTable
              students={(students ?? [])
                .sort((a, b) => a['Nom'].localeCompare(b['Nom']))
                .map((student, index) => ({
                  lastName: student['Nom'].toUpperCase(),
                  firstName: capitalizeName(student['Prénom']),
                  identifier: index + 1,
                  userId: (index + 1).toString(),
                }))}
            />
            <ScrollBar orientation="vertical" />
          </ScrollArea>

          <DialogFooter>
            <LoadingButton Icon={Save} label="Valider" loading={false} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
