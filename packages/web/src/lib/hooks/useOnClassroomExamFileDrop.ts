import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { useUserOrganizations } from '../contexts';
import { trpc, uploadFileOnS3, useIntl } from '../utils';

export const useOnClassroomExamFileDrop = (
  callback?: () => PromiseLike<void>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
  const t = useIntl();
  const { selectedOrganization } = useUserOrganizations();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } =
    trpc.classroomExamUploadedFilePresignedUrlPost.useMutation();

  const onError = useCallback(() => {
    toast(
      t.formatMessage({
        id: 'common.error',
      }),
      {
        description: t.formatMessage({
          id: 'exams.upload.fileError',
        }),
        action: {
          label: t.formatMessage({ id: 'common.close' }),
          onClick: () => {},
        },
      },
    );
    setIsLoading(false);
  }, [t]);

  const onDrop = useCallback(
    ({ examId, classroomId }: { examId: string; classroomId: string }) =>
      (acceptedFiles: File[]) => {
        setIsLoading(true);
        const uploadedFile = acceptedFiles[0];
        mutate(
          {
            fileName: uploadedFile.name,
            examId,
            organizationId: selectedOrganization.id,
            classroomId,
          },
          {
            onSuccess: ({ url, fields }) => {
              void uploadFileOnS3({ file: uploadedFile, url, fields })
                .catch(() => {
                  onError();
                })
                .then(() => callback?.())
                .then(() => setIsLoading(false));
            },
            onError: () => {
              onError();
            },
          },
        );
      },
    [mutate, onError, callback, selectedOrganization.id],
  );

  return { onDrop, isLoading };
};
