import { ExternalLink, Loader2 } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { FileType } from '@corrector/shared';

import { SelectedFile, trpc, useUserOrganizations } from '~/lib';

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '../ui';
import { DeleteFileDialog } from './DeleteFileDialog';

type FileActionsProps = {
  examId: string;
  fileType: FileType;
  file: SelectedFile;
  setSelectedFile?: (value: SelectedFile) => void;
};

export const FileActions = ({
  examId,
  fileType,
  file,
  setSelectedFile,
}: FileActionsProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const [urlToOpen, setUrlToOpen] = useState<string>();
  const {
    data: url,
    isLoading: urlLoading,
    refetch: queryUrl,
  } = trpc.presignedUrlGet.useQuery(
    {
      organizationId: selectedOrganization.id,
      fileType,
      fileId: file.id,
      examId,
    },
    { enabled: false, refetchOnMount: false },
  );

  useEffect(() => {
    url !== undefined && setUrlToOpen(url);
  }, [url]);
  useEffect(() => {
    urlToOpen !== undefined && window.open(urlToOpen, '_blank')?.focus();
    setUrlToOpen(undefined);
  }, [urlToOpen]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={e => {
              e.stopPropagation();
              void queryUrl();
            }}
          >
            {urlLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <ExternalLink />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <FormattedMessage id="exams.files.open" />
        </TooltipContent>
      </Tooltip>
      <DeleteFileDialog
        fileType={fileType}
        examId={examId}
        fileId={file.id}
        setSelectedFile={setSelectedFile}
      />
    </>
  );
};
