type Organization = {
  id: string;
  admin: boolean;
  name: string;
};

export type UserOrganizations = {
  selectedOrganization: Organization;
  organizations: Organization[];
};
