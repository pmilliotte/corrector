import { Play } from 'lucide-react';
import { ReactElement } from 'react';

import { trpc } from '~/lib';

import { LoadingButton } from './shared';

export const TestApi = (): ReactElement => {
  const { isPending } = trpc.pdfSplitToImages.useMutation();

  return (
    <LoadingButton
      onClick={() => {}}
      Icon={Play}
      loading={isPending}
      label="Test"
    />
  );
};
