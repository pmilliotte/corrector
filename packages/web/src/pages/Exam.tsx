import { Ban, FileCheck } from 'lucide-react';
import { Fragment, ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

import { FILE_TYPES } from '@corrector/shared';

import { DeleteFileDialog, UploadFileDialog } from '~/components';
import { Separator } from '~/components/ui';
import { trpc, useUserOrganizations } from '~/lib';

export const Exam = (): ReactElement => {
  const { examId } = useParams() as { examId: string };
  const { selectedOrganization } = useUserOrganizations();

  const { data: exam } = trpc.examGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });
  const { data: fileNames } = trpc.examFilesGet.useQuery({
    id: examId,
    organizationId: selectedOrganization.id,
  });

  return exam === undefined ? (
    <></>
  ) : (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col">
        <div className="font-semibold text-xl">{exam.exam.name}</div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage
            id="exams.createdOn"
            values={{
              date: new Date(exam.exam.created).toLocaleString().slice(0, 10),
            }}
          />
        </div>
      </div>
      <Separator />
      <div className="flex flex-col">
        <div className="font-semibold">
          <FormattedMessage id="exams.files.title" />
        </div>
        <div className="text-muted-foreground text-sm">
          <FormattedMessage id="exams.files.description" />
        </div>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border p-4">
        {FILE_TYPES.map((fileType, index) => (
          <Fragment key={fileType}>
            <div
              key={fileType}
              className="text-sm flex items-center justify-between"
            >
              {fileNames?.[fileType] !== undefined ? (
                <>
                  <div className="flex items-center gap-2">
                    <FileCheck />
                    <div>
                      <div className="font-semibold">
                        <FormattedMessage id={`exams.files.${fileType}`} />
                      </div>
                      <div className="text-xs">
                        {fileNames[fileType] ?? (
                          <FormattedMessage id="common." />
                        )}
                      </div>
                    </div>
                  </div>
                  <DeleteFileDialog fileType={fileType} examId={examId} />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Ban className="text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground">
                        <FormattedMessage id={`exams.files.${fileType}`} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <FormattedMessage id="exams.files.empty" />
                      </div>
                    </div>
                  </div>
                  <UploadFileDialog fileType={fileType} examId={examId} />
                </>
              )}
            </div>
            {index !== FILE_TYPES.length - 1 && <Separator />}
          </Fragment>
        ))}
      </div>
    </div>
  );
};
