import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  AppRoute,
  SELECTED_ORGANIZATION_ID,
  USER_ID_PLACEHOLDER,
} from '../constants';
import { useSession } from '../contexts';
import { UserOrganizations } from '../types';
import { trpc, useIntl } from '../utils';

export const useOrganizations = (): {
  userOrganizations: UserOrganizations | undefined;
  setSelectedOrganizationId: (id: string) => void;
} => {
  const t = useIntl();
  const navigate = useNavigate();
  const { id: userId } = useSession();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>(
    localStorage.getItem(SELECTED_ORGANIZATION_ID) ?? userId,
  );
  const { data, error } = trpc.organizationList.useQuery();

  if (error !== null) {
    navigate(AppRoute.Login);
  }

  const personalOrganization = {
    id: userId,
    admin: true,
    name: t.formatMessage({ id: 'common.personalSpace' }),
  };

  const selectedOrganization =
    data?.find(({ id }) => id === selectedOrganizationId) ??
    personalOrganization;

  const organizations =
    data === undefined
      ? undefined
      : [
          ...data.map(({ id, name, admin }) => ({ id, name, admin })),
          personalOrganization,
        ];

  userId !== USER_ID_PLACEHOLDER &&
    localStorage.setItem(SELECTED_ORGANIZATION_ID, selectedOrganization.id);

  return {
    userOrganizations:
      organizations === undefined
        ? undefined
        : { selectedOrganization, organizations },
    setSelectedOrganizationId: (id: string) => {
      localStorage.setItem(SELECTED_ORGANIZATION_ID, id);
      setSelectedOrganizationId(id);
    },
  };
};
