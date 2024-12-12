import { FileStatus } from '@corrector/shared';

export type Response = {
  id: string;
  status: FileStatus;
  filename?: string | undefined;
  uploadedAt?: string | undefined;
};
