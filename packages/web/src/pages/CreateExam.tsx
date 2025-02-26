import { ReactElement, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { CreateExamForm } from '~/components/Exams/CreateExamForm';
import { useBreadcrumb } from '~/lib';

export const CreateExam = (): ReactElement => {
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: "Création d'examen" }]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 h-full max-w-full w-full flex flex-col gap-2">
      <div className="w-full h-full">
        <div className="flex flex-col gap-2 h-full">
          <div>
            <div className="text-lg font-semibold">
              <FormattedMessage id="exams.create" />
            </div>
            <p className="text-muted-foreground text-sm">
              <FormattedMessage id="exams.createDescription" />
            </p>
          </div>
          <div className="flex items-center justify-around h-full">
            <CreateExamForm labelPosition="top" />
          </div>
        </div>
      </div>
    </div>
  );
};
