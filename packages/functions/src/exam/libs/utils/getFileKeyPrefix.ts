import {
  EXAM_BLANK,
  EXAM_RESPONSE,
  FILE_TYPES,
  FileType,
  PDF_FILE_NAME,
} from '@corrector/shared';

export const getFileKeyPrefix = ({
  organizationId,
  userId,
  examId,
  fileType,
  fileId,
}: {
  organizationId: string;
  userId?: string;
  examId?: string;
  fileType?: string;
  fileId?: string;
}): string => {
  if (userId === undefined) {
    return `organizations/${organizationId}/users`;
  }
  if (examId === undefined) {
    return `organizations/${organizationId}/users/${userId}/exams`;
  }
  if (fileType === undefined) {
    return `organizations/${organizationId}/users/${userId}/exams/${examId}`;
  }
  if (fileId === undefined || fileType === EXAM_BLANK) {
    return `organizations/${organizationId}/users/${userId}/exams/${examId}/${fileType}`;
  }

  return `organizations/${organizationId}/users/${userId}/exams/${examId}/${fileType}/${fileId}`;
};

const EXAM_BLANK_KEY_PREFIX_REGEXP = new RegExp(
  `^organizations/([0-9a-fA-F-]{36})/users/([0-9a-fA-F-]{36})/exams/([0-9a-fA-F-]{36})/(${EXAM_BLANK})/.*`,
);
const EXAM_RESPONSE_KEY_PREFIX_REGEXP = new RegExp(
  `^organizations/([0-9a-fA-F-]{36})/users/([0-9a-fA-F-]{36})/exams/([0-9a-fA-F-]{36})/(${EXAM_RESPONSE})/([0-9a-fA-F-]{36})/.*`,
);

export const parseKey = (
  keyPrefix: string,
): {
  organizationId: string;
  userId: string;
  examId: string;
  fileType: FileType;
  fileId?: string;
} => {
  const matchResponse = EXAM_RESPONSE_KEY_PREFIX_REGEXP.exec(keyPrefix);
  const matchExamBlank = EXAM_BLANK_KEY_PREFIX_REGEXP.exec(keyPrefix);
  const match = matchResponse ?? matchExamBlank;

  if (match === null) {
    throw new Error();
  }

  const [_, organizationId, userId, examId, fileType, fileId] = match;

  if (!isFileType(fileType)) {
    throw new Error();
  }

  return { organizationId, userId, examId, fileType, fileId };
};

const isFileType = (fileType: string): fileType is FileType =>
  ([...FILE_TYPES] as string[]).includes(fileType);

export const getExamBlankFileName = ({
  organizationId,
  userId,
  examId,
}: {
  organizationId: string;
  userId: string;
  examId: string;
}): string =>
  `${getFileKeyPrefix({
    organizationId,
    userId,
    examId,
  })}/${EXAM_BLANK}/${PDF_FILE_NAME}.pdf`;

export const getResponseFileName = ({
  organizationId,
  userId,
  examId,
  fileId,
}: {
  organizationId: string;
  userId: string;
  examId: string;
  fileId: string;
}): string =>
  `${getFileKeyPrefix({
    organizationId,
    userId,
    examId,
  })}/${EXAM_RESPONSE}/${fileId}/${PDF_FILE_NAME}.pdf`;

export const getFileName = ({
  organizationId,
  userId,
  examId,
  fileId,
  fileType,
}: {
  organizationId: string;
  userId: string;
  examId: string;
} & (
  | {
      fileId?: string;
      fileType: typeof EXAM_BLANK;
    }
  | {
      fileId: string;
      fileType: typeof EXAM_RESPONSE;
    }
)): string => {
  switch (fileType) {
    case EXAM_BLANK:
      return getExamBlankFileName({ organizationId, userId, examId });
    case EXAM_RESPONSE:
      return getResponseFileName({ organizationId, userId, examId, fileId });
  }
};
