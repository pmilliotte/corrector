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
