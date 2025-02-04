import { Play } from 'lucide-react';
import { ReactElement } from 'react';

import { trpc } from '~/lib';

import { LoadingButton } from './shared';

export const TestApi = (): ReactElement => {
  const { mutate, isPending } = trpc.pdfSplitToImages.useMutation();

  return (
    <LoadingButton
      onClick={() => {
        mutate();
      }}
      Icon={Play}
      loading={isPending}
      label="Test"
    />
  );
};
