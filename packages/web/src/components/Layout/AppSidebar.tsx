import { signOut } from '@aws-amplify/auth';
import { QueryClientContext } from '@tanstack/react-query';
import { ComponentProps, ReactElement, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import { SidebarGroup as SidebarGroupType, UserOrganizations } from '~/lib';

import {
  Button,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '../ui';
import { OrganizationSwitcher } from './OrganizationSwitcher';

type AppSidebarProps = {
  groups: SidebarGroupType[];
  setSelectedOrganizationId: (id: string) => void;
  userOrganizations: UserOrganizations | undefined;
};

export const AppSidebar = ({
  groups,
  setSelectedOrganizationId,
  userOrganizations,
  ...props
}: AppSidebarProps & ComponentProps<typeof Sidebar>): ReactElement => {
  const { pathname } = useLocation();
  const queryClient = useContext(QueryClientContext);
  const signout = async () => {
    await signOut({ global: true });
    await queryClient?.invalidateQueries({ queryKey: ['authSession'] });
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          setSelectedOrganizationId={setSelectedOrganizationId}
          userOrganizations={userOrganizations}
        />
      </SidebarHeader>
      <SidebarContent>
        {groups.map(group => (
          <SidebarGroup key={group.title} className={group.className}>
            {group.displayTitle && (
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === (item.url as string)}
                    >
                      <span>
                        <item.icon className="mr-2 h-4 w-4" />
                        <Link to={item.url}>{item.title}</Link>
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button className="w-full" variant="secondary" onClick={signout}>
          <FormattedMessage id="common.logout" />
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
