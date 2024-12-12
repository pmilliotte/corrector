import { useEffect, useState } from 'react';

import { Exam, Response, SelectedFile } from '../types';
import { trpc } from '../utils';

type useSelectedFilesParams = {
  examId: string;
  organizationId: string;
};

type UseSelectedFilesOutput = {
  responses?: Response[];
  responsesLoading: boolean;
  selectedFile: SelectedFile;
  setSelectedFile: (value: SelectedFile) => void;
  examLoading: boolean;
  exam?: Exam;
};

export const useSelectedFile = ({
  examId,
  organizationId,
}: useSelectedFilesParams): UseSelectedFilesOutput => {
  const [selectedFile, setSelectedFile] = useState<SelectedFile>({
    id: 'fakeId',
    status: 'toBeUploaded',
  });

  const { data: examResponse, isLoading: examLoading } = trpc.examGet.useQuery(
    {
      id: examId,
      organizationId,
    },
    { refetchOnMount: false },
  );

  useEffect(() => {
    if (examResponse === undefined || selectedFile.id !== 'subject') {
      return;
    }

    setSelectedFile(prevFile => {
      console.log('prevFile', prevFile);
      if (
        prevFile.id === 'subject' &&
        prevFile.status !== examResponse.exam.status
      ) {
        console.log('updateSelectedSubjectStatus', examResponse.exam.status);

        return { id: 'subject', status: examResponse.exam.status };
      }

      return prevFile;
    });
  }, [examResponse, selectedFile.id]);

  const { data: responseList, isLoading: responseListLoading } =
    trpc.responseList.useQuery(
      {
        examId: examId,
        organizationId,
      },
      { refetchOnMount: false },
    );

  useEffect(() => {
    if (responseList === undefined) {
      return;
    }
    const toBeUploadedResponse = responseList.responses.find(
      ({ status: responseStatus }) => responseStatus === 'toBeUploaded',
    );
    if (toBeUploadedResponse !== undefined) {
      console.log('update with toBeUploaded response');
      setSelectedFile({
        id: toBeUploadedResponse.id,
        status: 'toBeUploaded',
      });

      return;
    }
    const selectedFileInResponseList = responseList.responses.find(
      ({ id }) => selectedFile.id === id,
    );
    if (selectedFileInResponseList === undefined) {
      console.log('update because not in list', selectedFile.id);

      setSelectedFile({
        id: 'subject',
        status: examResponse?.exam.status ?? 'toBeUploaded',
      });

      return;
    }

    setSelectedFile(prevFile => {
      console.log('prevFile', prevFile);
      if (
        prevFile.id === selectedFileInResponseList.id &&
        prevFile.status !== selectedFileInResponseList.status
      ) {
        console.log(
          'updateSelected file Status',
          selectedFileInResponseList.status,
        );

        return {
          id: selectedFileInResponseList.id,
          status: selectedFileInResponseList.status,
        };
      }

      return prevFile;
    });
  }, [
    responseList,
    setSelectedFile,
    selectedFile.id,
    examResponse?.exam.status,
  ]);

  return {
    responses: responseList?.responses,
    responsesLoading: responseListLoading,
    selectedFile,
    setSelectedFile,
    examLoading,
    exam: examResponse?.exam,
  };
};
