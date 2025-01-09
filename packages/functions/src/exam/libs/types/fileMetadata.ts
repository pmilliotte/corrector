import { ExamUploadedFileStatus } from '@corrector/shared';

export type Metadata = {
  'x-amz-meta-original-file-name': string;
  'x-amz-meta-uploaded-by'?: string;
  'x-amz-meta-file-status'?: ExamUploadedFileStatus;
};
