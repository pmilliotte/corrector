import { useCallback, useState } from 'react';
import { toast } from 'sonner';

import { trpc, uploadFileOnS3, useIntl } from '../utils';

export const useOnExamFileDrop = (
  type: 'uploadFiles' | 'uploadSubject',
  callback?: () => PromiseLike<void>,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
) => {
  const t = useIntl();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate } = trpc.examUploadedFilePresignedUrlPost.useMutation();

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
    ({ examId }: { examId: string }) =>
      (acceptedFiles: File[]) => {
        setIsLoading(true);
        const uploadedFile =
          acceptedFiles.length > 0 ? acceptedFiles[0] : undefined;
        if (uploadedFile === undefined) {
          toast("Une erreur s'est produite", {
            description: 'Impossible de télécharger le fichier',
            action: {
              label: t.formatMessage({ id: 'common.close' }),
              onClick: () => {},
            },
          });
          setIsLoading(false);

          return;
        }
        mutate(
          {
            fileName: uploadedFile.name,
            examId,
            type,
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
    [mutate, onError, callback, type, t],
  );

  return { onDrop, isLoading };
};
