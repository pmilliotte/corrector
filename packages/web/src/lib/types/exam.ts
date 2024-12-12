import { Division, FileStatus, Subject } from '@corrector/shared';

export type Exam = {
  id: string;
  status: FileStatus;
  name: string;
  subject: Subject;
  division: Division;
  subjectUploadedAt?: string;
  subjectFileName?: string;
  created: string;
};
