import { ReactElement, useEffect } from 'react';

import { useBreadcrumb } from '~/lib';

export const Settings = (): ReactElement => {
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: 'Paramètres du compte' }]);

    return () => setBreadcrumb([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className="h-full flex items-center justify-around" />;
};
