import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_RESPONSE } from '@corrector/shared';

import { SelectedFile, trpc, useUserOrganizations } from '~/lib';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui';
import { FileActions } from './FileActions';
import { UploadFile } from './UploadFile';

type ResponseProps = {
  examId: string;
  file: SelectedFile;
  setSelectedFile: (value: SelectedFile) => void;
};

const TABS = ['analysis', 'correction'];

const DEFAULT_TAB = {
  toBeUploaded: 'analysis',
  fileUploaded: 'analysis',
  imagesUploaded: 'analysis',
  analyzed: 'analysis',
  corrected: 'correction',
};

export const Response = ({
  examId,
  file,
  setSelectedFile,
}: ResponseProps): ReactElement => {
  const utils = trpc.useUtils();
  const { selectedOrganization } = useUserOrganizations();
  const { mutate, isPending } = trpc.responseDelete.useMutation({
    onSuccess: async () => {
      await utils.responseList.invalidate();
    },
  });

  if (file.status === 'toBeUploaded') {
    return (
      <>
        <UploadFile
          examId={examId}
          fileType={EXAM_RESPONSE}
          callback={() => utils.responseList.refetch()}
          file={file}
          cancel={{
            loading: isPending,
            function: () =>
              mutate({
                responseId: file.id,
                examId,
                organizationId: selectedOrganization.id,
              }),
          }}
        />
      </>
    );
  }

  return (
    <Tabs
      defaultValue={DEFAULT_TAB[file.status]}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <TabsList className="grid grid-cols-2">
          {TABS.map(tab => (
            <TabsTrigger key={tab} value={tab} id={`exam.tabs.${tab}`}>
              <FormattedMessage id={`exams.tabs.${tab}`} />
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex items-center">
          <FileActions
            examId={examId}
            fileType={EXAM_RESPONSE}
            file={file}
            setSelectedFile={setSelectedFile}
          />
        </div>
      </div>
      <TabsContent value="analysis" />
    </Tabs>
  );
};
