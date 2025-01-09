import { EXAM_UPLOADED_FILE_STATUSES } from '../constants';

export type ExamUploadedFileStatus =
  (typeof EXAM_UPLOADED_FILE_STATUSES)[number];
