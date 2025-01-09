import { Loader2, Upload as UploadIcon } from 'lucide-react';
import { ReactElement } from 'react';
import Dropzone from 'react-dropzone';
import { FormattedMessage } from 'react-intl';

import { MAX_FILE_SIZE_BYTES } from '@corrector/shared';

import { cn } from '~/lib';

type UploadProps = {
  onDrop: (acceptedFiles: File[]) => void;
  loading: boolean;
};

export const Upload = ({ onDrop, loading }: UploadProps): ReactElement => (
  <Dropzone
    onDrop={onDrop}
    accept={{ 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] }}
    multiple={false}
    maxFiles={1}
    maxSize={MAX_FILE_SIZE_BYTES}
  >
    {({ getRootProps, getInputProps, isDragActive }) => (
      <div
        {...getRootProps()}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        className={cn(
          'group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25',
          'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-secondary',
          isDragActive && 'border-muted-foreground/50',
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 sm:px-5">
          <div className=" p-3">
            {loading ? (
              <Loader2
                className="text-muted-foreground animate-spin"
                aria-hidden="true"
              />
            ) : (
              <UploadIcon
                className="text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-muted-foreground">
            <FormattedMessage id="exams.dragAndDrop" />
          </p>
        </div>
      </div>
    )}
  </Dropzone>
);
