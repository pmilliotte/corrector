import { EXAM_UPLOADED_FILE_STATUSES } from '../constants';

export type ExamUploadedFileStatus =
  (typeof EXAM_UPLOADED_FILE_STATUSES)[number];

export const isExamUploadedFileStatus = (
  status: string,
): status is ExamUploadedFileStatus =>
  (EXAM_UPLOADED_FILE_STATUSES as unknown as string[]).includes(status);
