import { Check, ChevronsUpDown, GalleryVerticalEnd } from 'lucide-react';
import { ReactElement } from 'react';
import { FormattedMessage } from 'react-intl';

import { UserOrganizations } from '~/lib';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Skeleton,
} from '../ui';

type OrganizationSwitcherProps = {
  setSelectedOrganizationId: (id: string) => void;
  userOrganizations: UserOrganizations | undefined;
};

export const OrganizationSwitcher = ({
  setSelectedOrganizationId,
  userOrganizations,
}: OrganizationSwitcherProps): ReactElement => (
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex flex-col gap-0.5 leading-none">
              <span className="font-semibold">
                <FormattedMessage id="common.sidebar.space" />
              </span>
              {userOrganizations?.selectedOrganization.name ?? (
                <Skeleton className="h-4 w-[100px]" />
              )}
            </div>
            <ChevronsUpDown className="ml-auto" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        {userOrganizations?.organizations && (
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width]"
            align="start"
          >
            {userOrganizations.organizations.map(({ id, name }) => (
              <DropdownMenuItem
                key={id}
                onSelect={() => setSelectedOrganizationId(id)}
              >
                {name}
                {id === userOrganizations.selectedOrganization.id && (
                  <Check className="ml-auto" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
);
