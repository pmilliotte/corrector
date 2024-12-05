export const getFileKeyPrefix = ({
  organizationId,
  userId,
  examId,
}: {
  organizationId: string;
  userId?: string;
  examId?: string;
}): string => {
  if (userId === undefined) {
    return `organizations/${organizationId}/users`;
  }
  if (examId === undefined) {
    return `organizations/${organizationId}/users/${userId}/exams`;
  }

  return `organizations/${organizationId}/users/${userId}/exams/${examId}`;
};

const KEY_PREFIX_REGEXP = new RegExp(
  '^organizations/([0-9a-fA-F-]{36})/users/([0-9a-fA-F-]{36})/exams/([0-9a-fA-F-]{36})$',
);

export const parseKeyPrefix = (
  keyPrefix: string,
): { organizationId: string; userId: string; examId: string } => {
  const match = KEY_PREFIX_REGEXP.exec(keyPrefix);

  console.log('keyPrefix', keyPrefix);

  if (match === null) {
    throw new Error();
  }

  const [_, organizationId, userId, examId] = match;

  return { organizationId, userId, examId };
};
