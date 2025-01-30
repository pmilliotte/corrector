import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';
import { useParams } from 'react-router-dom';

export const ClassroomExam = (): ReactElement => {
  const { classroomId, examId } = useParams() as {
    classroomId: string;
    examId: string;
  };

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">
          <FormattedMessage id="classroomExam.title" />
        </div>
        {/* eslint-disable-next-line formatjs/no-literal-string-in-jsx */}
        {classroomId} - {examId}
      </div>
    </div>
  );
};
