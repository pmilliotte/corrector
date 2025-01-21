import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { ReactElement, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';

import { trpc, useOnProblemDrop } from '~/lib';

import { Button, ScrollArea, ScrollBar } from '../ui';
import { Upload } from '../Upload';

type ExamUploadedFilesProps = {
  examId: string;
};

export const ExamUploadFiles = ({
  examId,
}: ExamUploadedFilesProps): ReactElement => {
  const utils = trpc.useUtils();
  const [analysing, setAnalysing] = useState(false);
  const { onDrop, isLoading: dropLoading } = useOnProblemDrop(async () => {
    await Promise.all([
      utils.examUploadedFileStatusList.invalidate(),
      utils.examUploadedFilePresignedUrlList.invalidate(),
    ]);
  });
  const { data: fileUrls, isLoading: fileUrlsLoading } =
    trpc.examUploadedFilePresignedUrlList.useQuery({
      examId,
    });
  const { data: fileStatuses, isLoading: fileStatusesLoading } =
    trpc.examUploadedFileStatusList.useQuery({
      examId,
    });
  const {
    mutate: removeFile,
    isPending: removeFilePending,
    variables,
  } = trpc.examUploadedFileDelete.useMutation({
    onSuccess: async () => {
      await Promise.all([
        utils.examUploadedFileStatusList.invalidate(),
        utils.examUploadedFilePresignedUrlList.invalidate(),
      ]);
    },
  });
  const { mutate: updateExam, isPending: updateExamPending } =
    trpc.examConfigureProblems.useMutation({
      onSuccess: async () => {
        await utils.examGet.invalidate();
      },
    });

  useEffect(() => {
    setAnalysing(
      fileStatuses?.find(({ status }) => status !== 'analyzed') !== undefined,
    );
    if (!analysing) {
      return;
    }

    const interval = setInterval(() => {
      void utils.examUploadedFileStatusList.invalidate();
    }, 2000);
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 50000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [utils, fileStatuses, analysing]);

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
            {fileUrls?.map(({ url, fileName }) => (
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
        onClick={() => updateExam({ id: examId })}
        disabled={fileStatuses === undefined || analysing || updateExamPending}
      >
        {updateExamPending ||
        fileUrlsLoading ||
        fileStatusesLoading ||
        analysing ? (
          <Loader2 className="animate-spin" size={16} />
        ) : (
          <ArrowRight size={16} />
        )}

        <FormattedMessage id="common.step" values={{ step: 2 }} />
      </Button>
    </div>
  );
};
