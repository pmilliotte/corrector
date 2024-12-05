import { useCallback, useState } from 'react';

import { FileType } from '@corrector/shared';

import { useUserOrganizations } from '../contexts';
import { trpc, uploadFileOnS3 } from '../utils';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useOnDrop = (callback?: () => PromiseLike<void>) => {
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = trpc.presignedUrlPost.useMutation();
  const { selectedOrganization } = useUserOrganizations();

  const onDrop = useCallback(
    ({ fileType, examId }: { fileType: FileType; examId: string }) =>
      (acceptedFiles: File[]) => {
        setIsLoading(true);
        const file = acceptedFiles[0];
        mutate(
          {
            fileName: file.name,
            fileType,
            organizationId: selectedOrganization.id,
            examId,
          },
          {
            onSuccess: ({ url, fields }) => {
              void uploadFileOnS3({ file, url, fields })
                .then(callback)
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
