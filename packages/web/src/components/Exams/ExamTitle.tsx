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
    <div className="flex items-baseline justify-between gap-2">
      <span className="font-semibold text-xl whitespace-nowrap overflow-hidden text-ellipsis">
        <FormattedMessage
          id="exams.exam.title"
          values={{
            subject: t.formatMessage({
              id: `common.subjects.${subject}`,
            }),
            name,
          }}
        />
      </span>
      <div className="text-muted-foreground text-sm whitespace-nowrap shrink-0">
        <FormattedMessage
          id="exams.createdOn"
          values={{
            date: new Date(created).toLocaleDateString('fr'),
          }}
        />
      </div>
    </div>
  );
};
