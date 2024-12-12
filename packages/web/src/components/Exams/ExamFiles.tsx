import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Loader2, Plus } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { EXAM_BLANK, EXAM_RESPONSE } from '@corrector/shared';

import {
  Exam,
  Response,
  SelectedFile,
  trpc,
  useUserOrganizations,
} from '~/lib';

import { Button, Separator } from '../ui';
import { ExamFile } from './ExamFile';

type ExamFilesProps = {
  exam: Required<Exam>;
  responses: Response[];
  responsesLoading: boolean;
  examLoading: boolean;
  selectedFile: SelectedFile;
  setSelectedFile: (value: SelectedFile) => void;
};

export const ADD_COPY_SELECTED = 'addCopy';

export const ExamFiles = ({
  exam,
  responses,
  responsesLoading,
  selectedFile,
  setSelectedFile,
}: ExamFilesProps): ReactElement => {
  const { selectedOrganization } = useUserOrganizations();
  const utils = trpc.useUtils();
  const { mutate: createResponse, isPending: createResponsePending } =
    trpc.responseCreate.useMutation({
      onSuccess: async ({ id }) => {
        await utils.responseList.invalidate();
        setSelectedFile({ id, status: 'toBeUploaded' });
      },
    });

  console.log(selectedFile);

  return (
    <ScrollArea className="max-h-screen h-full">
      <div className="flex flex-col gap-1">
        <ExamFile
          fileName={exam.subjectFileName}
          uploadedAt={exam.subjectUploadedAt}
          file={{ id: 'subject', status: exam.status }}
          selectedFile={selectedFile}
          setSelectedFile={setSelectedFile}
          fileType={EXAM_BLANK}
          examId={exam.id}
        />
        <Separator />
        <Button
          disabled={
            selectedFile.status === 'toBeUploaded' ||
            responsesLoading ||
            createResponsePending
          }
          onClick={() =>
            createResponse({
              organizationId: selectedOrganization.id,
              examId: exam.id,
            })
          }
          className="flex items-center gap-2"
          variant="ghost"
        >
          {createResponsePending ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Plus size={16} />
          )}
          <FormattedMessage id="exams.responses.addResponse" />
        </Button>
        {responses
          .sort((a, b) =>
            (b.uploadedAt ?? '').localeCompare(a.uploadedAt ?? ''),
          )
          .map(
            response =>
              response.filename !== undefined &&
              response.uploadedAt !== undefined && (
                <ExamFile
                  key={response.id}
                  fileName={response.filename}
                  uploadedAt={response.uploadedAt}
                  file={{ id: response.id, status: response.status }}
                  selectedFile={selectedFile}
                  setSelectedFile={setSelectedFile}
                  fileType={EXAM_RESPONSE}
                  examId={exam.id}
                />
              ),
          )}
      </div>
    </ScrollArea>
  );
};
