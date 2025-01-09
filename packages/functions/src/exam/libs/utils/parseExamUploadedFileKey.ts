const EXAM_UPLOADED_FILE_REGEXP = new RegExp(
  `^users/([0-9a-fA-F-]{36})/exams/([0-9a-fA-F-]{36})/uploadedFiles/([0-9]{13}).([a-z]+)$`,
);

export const parseExamUploadedFileKey = (
  key: string,
):
  | {
      userId: string;
      examId: string;
      fileName: string;
    }
  | undefined => {
  const match = EXAM_UPLOADED_FILE_REGEXP.exec(key);

  if (match === null) {
    return undefined;
  }

  const [_, userId, examId, timestamp, extension] = match;

  return { userId, examId, fileName: `${timestamp}.${extension}` };
};
