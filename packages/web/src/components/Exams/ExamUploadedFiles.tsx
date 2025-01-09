import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc, useOnProblemDrop } from '~/lib';

import { Button, ScrollArea, ScrollBar } from '../ui';
import { Upload } from '../Upload';

type ExamUploadedFilesProps = {
  examId: string;
};

export const ExamUploadedFiles = ({
  examId,
}: ExamUploadedFilesProps): ReactElement => {
  const utils = trpc.useUtils();
  const { onDrop, isLoading: dropLoading } = useOnProblemDrop(async () => {
    await utils.examUploadedFilePresignedUrlList.invalidate();
  });
  const { data: files } = trpc.examUploadedFilePresignedUrlList.useQuery({
    examId,
  });
  const {
    mutate: removeFile,
    isPending: removeFilePending,
    variables,
  } = trpc.examUploadedFileDelete.useMutation({
    onSuccess: async () => {
      await utils.examUploadedFilePresignedUrlList.invalidate();
    },
  });
  const { mutate: updateExam, isPending: updateExamPending } =
    trpc.examUpdate.useMutation({
      onSuccess: async () => {
        await utils.examGet.invalidate();
      },
    });

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="font-semibold">
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        <FormattedMessage id="common.step" values={{ step: 1 }} /> :{' '}
        <FormattedMessage id="exams.upload.problem.label" />
      </div>
      <Upload onDrop={onDrop({ examId })} loading={dropLoading} />
      <div className="relative h-full">
        <ScrollArea>
          <div className="flex space-x-4 py-2 pb-2">
            {files?.map(({ url, fileName }) => (
              <div className="relative" key={fileName}>
                <div className="w-[250px] aspect-[3/4] border rounded-lg overflow-hidden relative">
                  <div
                    style={{ backgroundImage: `url(${url})` }}
                    className="bg-contain w-full h-full bg-no-repeat bg-center hover:scale-105"
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute bottom-0 left-[50%] rounded-full -translate-y-1/2 -translate-x-1/2"
                  onClick={() => removeFile({ fileName, examId })}
                >
                  {removeFilePending && variables.fileName === fileName ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Trash2 size={16} className="text-destructive" />
                  )}
                </Button>
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <Button
        className="self-end flex gap-2"
        onClick={() => updateExam({ id: examId, status: 'configureProblems' })}
      >
        {updateExamPending ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}

        <FormattedMessage id="common.step" values={{ step: 2 }} />
      </Button>
    </div>
  );
};
