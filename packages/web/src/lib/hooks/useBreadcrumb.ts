import isEqual from 'lodash/isEqual';

import { AppRoute } from '../constants';
import {
  Breadcrumb,
  useBreadcrumbContext,
  useUserOrganizations,
} from '../contexts';

export const useBreadcrumb = (): {
  setBreadcrumb: (breadcrumb: Breadcrumb) => void;
} => {
  const { setBreadcrumb } = useBreadcrumbContext();
  const { selectedOrganization } = useUserOrganizations();

  return {
    setBreadcrumb: (breadcrumb: Breadcrumb) => {
      const fullBreadcrumb = [
        { label: selectedOrganization.name, linkTo: AppRoute.Home },
        ...breadcrumb,
      ];

      setBreadcrumb?.(prevBreadcrumb =>
        isEqual(prevBreadcrumb, fullBreadcrumb)
          ? prevBreadcrumb
          : fullBreadcrumb,
      );
    },
  };
};
