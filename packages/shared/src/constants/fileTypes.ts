export const PDF_FILE_NAME = 'file';

export const EXAM_BLANK = 'exam-blank';
export const EXAM_BLANK_PATH_SUFFIX = `/${EXAM_BLANK}/${PDF_FILE_NAME}.pdf`;

export const FILE_TYPES = [
  EXAM_BLANK,
  'exam-solutions',
  'exam-responses',
] as const;
