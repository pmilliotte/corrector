import { ReactElement } from 'react';

import { FileType } from '@corrector/shared';

import { cn, SelectedFile } from '~/lib';

type ExamFileProps = {
  examId: string;
  fileName: string;
  file: SelectedFile;
  uploadedAt?: string;
  fileType: FileType;
  selectedFile: SelectedFile;
  setSelectedFile: (value: SelectedFile) => void;
};

export const ExamFile = ({
  file,
  selectedFile,
  fileName,
  uploadedAt,
  setSelectedFile,
}: ExamFileProps): ReactElement => {
  const isUploadingFile = selectedFile.status === 'toBeUploaded';

  return (
    <button
      className={cn(
        `grow min-w-0 flex items-center justify-between gap-2 rounded-lg border p-3 text-left text-sm transition-all ${!isUploadingFile && 'hover:bg-accent'}`,
        selectedFile.id === file.id && 'bg-muted',
      )}
      disabled={isUploadingFile}
      onClick={() => setSelectedFile(file)}
    >
      <div className="grow min-w-0 flex flex-col items-start gap-2">
        <div className="font-semibold w-full whitespace-nowrap overflow-hidden text-ellipsis">
          {fileName}
        </div>
        {uploadedAt !== undefined && (
          <div className="text-sm text-muted-foreground w-full whitespace-nowrap overflow-hidden text-ellipsis">
            {new Date(uploadedAt).toLocaleDateString('fr')}
          </div>
        )}
      </div>
    </button>
  );
};
