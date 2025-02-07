import { ReactElement } from 'react';

import { ClassroomExam } from '@corrector/functions';

import { trpc, useOnClassroomExamFileDrop } from '~/lib';

import { Upload } from '../Upload';
import { ClassroomExamAnswers } from './ClassroomExamAnswers';

type ClassroomExamUploadAnswersProps = {
  classroomExam: ClassroomExam;
};

export const ClassroomExamUploadAnswers = ({
  classroomExam,
}: ClassroomExamUploadAnswersProps): ReactElement => {
  const utils = trpc.useUtils();
  const { onDrop, isLoading: dropLoading } = useOnClassroomExamFileDrop(
    async () => {
      await utils.pdfPresignedUrlGet.invalidate();
    },
  );

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="font-semibold">Télécharger les copies</div>
      <Upload
        onDrop={onDrop({
          examId: classroomExam.examId,
          classroomId: classroomExam.classroomId,
        })}
        loading={dropLoading}
        label="Télécharger les réponses (.pdf)"
        accept="pdf"
        disabled={false}
      />
      <ClassroomExamAnswers
        examId={classroomExam.examId}
        classroomId={classroomExam.classroomId}
      />
    </div>
  );
};
