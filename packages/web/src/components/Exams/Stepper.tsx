import { ReactElement } from 'react';

import { ExamStatus } from '@corrector/shared';

type StepperProps = {
  status?: ExamStatus;
};

// const stepOrder: Record<ExamStatus, number> = {
//   subject: 0,
//   imagesUploaded: 1,
//   marks: 2,
//   responses: 3,
//   correction: 4,
// };

// const stepIcons: Record<ExamStatus, ReactElement> = {
//   subject: <File />,
//   imagesUploaded: <FileCheck />,
//   marks: <Tag />,
//   responses: <FileText />,
//   correction: <FileCheck />,
// };

// const sortedExamStatuses = [...EXAM_STATUSES].sort(
//   (a, b) => stepOrder[a] - stepOrder[b],
// );

// const getWrapperClassName = ({
//   status,
//   index,
// }: {
//   status?: ExamStatus;
//   index: number;
// }): string =>
//   `p-2 rounded-full ${status !== undefined && stepOrder[status] >= index ? 'bg-primary text-white' : 'text-muted-foreground'}`;
// const getSeparatorClassName = ({
//   status,
//   index,
// }: {
//   status?: ExamStatus;
//   index: number;
// }): string =>
//   index >= EXAM_STATUSES.length - 1
//     ? 'hidden'
//     : `flex-auto mb-4 ${status !== undefined && stepOrder[status] > index && 'bg-primary'}`;
// const getTitleClassName = ({
//   status,
//   index,
// }: {
//   status?: ExamStatus;
//   index: number;
// }): string =>
//   `font-semi-bold ${status !== undefined && stepOrder[status] < index && 'text-muted-foreground'}`;

export const Stepper = ({ status: _status }: StepperProps): ReactElement => (
  <div className="flex items-center gap-4 w-full">
    {/* {sortedExamStatuses.map((examStatus, index) => (
      <Fragment key={examStatus}>
        <div className="flex flex-col items-center gap-2">
          <div className={getWrapperClassName({ status, index })}>
            {stepIcons[examStatus]}
          </div>
          <div className={getTitleClassName({ status, index })}>
            <FormattedMessage id={`exams.status.${examStatus}.title`} />
          </div>
        </div>
        <Separator className={getSeparatorClassName({ status, index })} />
      </Fragment>
    ))} */}
  </div>
);
