import { ReactElement } from 'react';

import { Exam, Response as ResponseType, SelectedFile } from '~/lib';

import { ExamFiles } from './ExamFiles';
import { Response } from './Response';
import { Subject } from './Subject';

type ExamContentProps = {
  setSelectedFile: (value: SelectedFile) => void;
  selectedFile: SelectedFile;
  exam: Required<Exam>;
  responses: ResponseType[];
  responsesLoading: boolean;
  examLoading: boolean;
};

export const ExamContent = ({
  exam,
  setSelectedFile,
  selectedFile,
  responses,
  responsesLoading,
  examLoading,
}: ExamContentProps): ReactElement => (
  <div className="flex gap-4 h-full">
    <div className="max-w-1/4 min-w-1/4">
      <ExamFiles
        exam={exam}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        responses={responses}
        responsesLoading={responsesLoading}
        examLoading={examLoading}
      />
    </div>
    <div className="grow">
      {selectedFile.id === 'subject' ? (
        <Subject examId={exam.id} status={exam.status} />
      ) : (
        <Response
          examId={exam.id}
          file={selectedFile}
          setSelectedFile={setSelectedFile}
        />
      )}
      {/* {selectedFile === ADD_COPY_SELECTED && (
          <div className="h-full flex items-center justify-around">
            <div className="flex flex-col">
              <div className="text-muted-foreground">
                <FormattedMessage id="exams.responses.description" />
              </div>
              <Upload
                onDrop={onDrop({ fileType: EXAM_RESPONSE, examId })}
                loading={dropLoading}
              />
            </div>
          </div>
        )}
        {selectedFile !== 'subject' && selectedFile !== ADD_COPY_SELECTED && (
          <Response
            status={status}
            examId={examId}
            fileId={selectedFile}
            setSelectedFile={setSelectedFile}
          />
        )} */}
    </div>
  </div>
);
