import { ReactElement, useEffect } from 'react';

import { useBreadcrumb } from '~/lib';

export const Settings = (): ReactElement => {
  const { setBreadcrumb } = useBreadcrumb();
  useEffect(() => {
    setBreadcrumb([{ label: 'Paramètres du compte' }]);

    return () => setBreadcrumb([]);
  }, []);

  return <div className="h-full flex items-center justify-around" />;
};
