import { ExamStatus } from '@corrector/shared';

export type Response = {
  id: string;
  status: ExamStatus;
  filename?: string | undefined;
  uploadedAt?: string | undefined;
};
