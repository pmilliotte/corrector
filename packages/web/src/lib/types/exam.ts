import { Division, ExamStatus, Subject } from '@corrector/shared';

export type Exam = {
  id: string;
  status: ExamStatus;
  name: string;
  subject: Subject;
  division: Division;
  subjectUploadedAt?: string;
  subjectFileName?: string;
  created: string;
};
