import { useCallback, useState } from 'react';

import { EXAM_BLANK, EXAM_RESPONSE } from '@corrector/shared';

import { useUserOrganizations } from '../contexts';
import { trpc, uploadFileOnS3 } from '../utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useOnDrop = (callback?: (fileId: string) => PromiseLike<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = trpc.presignedUrlPost.useMutation();
  const { selectedOrganization } = useUserOrganizations();

  const onDrop = useCallback(
    ({
      examId,
      ...file
    }: {
      examId: string;
    } & (
      | { fileType: typeof EXAM_BLANK; fileId?: string }
      | { fileType: typeof EXAM_RESPONSE; fileId: string }
    )) =>
      (acceptedFiles: File[]) => {
        setIsLoading(true);
        const uploadedFile = acceptedFiles[0];
        mutate(
          {
            fileName: uploadedFile.name,
            organizationId: selectedOrganization.id,
            examId,
            ...file,
          },
          {
            onSuccess: ({ url, fields, id }) => {
              void uploadFileOnS3({ file: uploadedFile, url, fields })
                .then(() => callback?.(id))
                .then(() => setIsLoading(false));
            },
            onError: () => {
              setIsLoading(false);
            },
          },
        );
      },
    [mutate, selectedOrganization, callback],
  );

  return { onDrop, isLoading };
};
