import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { useIntl } from '~/lib';

type ExamTitleProps = {
  subject: string;
  name: string;
  created: string;
};

export const ExamTitle = ({
  name,
  subject,
  created,
}: ExamTitleProps): ReactElement => {
  const t = useIntl();

  return (
    <div className="flex items-baseline justify-between">
      <div className="font-semibold text-xl">
        <FormattedMessage
          id="exams.exam.title"
          values={{
            subject: t.formatMessage({
              id: `common.subjects.${subject}`,
            }),
            name,
          }}
        />
      </div>
      <div className="text-muted-foreground text-sm">
        <FormattedMessage
          id="exams.createdOn"
          values={{
            date: new Date(created).toLocaleString().slice(0, 10),
          }}
        />
      </div>
    </div>
  );
};
