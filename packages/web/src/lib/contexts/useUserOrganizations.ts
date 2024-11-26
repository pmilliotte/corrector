import { createContext, useContext } from 'react';

import { UserOrganizations } from '../types';

const defaultUserOrganizations = {
  selectedOrganization: { id: 'fakeId', name: 'fakeName', admin: false },
  organizations: [],
};
export const UserOrganizationsContext = createContext<UserOrganizations>(
  defaultUserOrganizations,
);

export const useUserOrganizations = (): UserOrganizations =>
  useContext(UserOrganizationsContext);
