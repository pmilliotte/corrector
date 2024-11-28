import { signOut } from '@aws-amplify/auth';
import { QueryClientContext } from '@tanstack/react-query';
import { ComponentProps, ReactElement, useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';

import {
  isSidebarItemActive,
  SidebarGroup as SidebarGroupType,
  UserOrganizations,
} from '~/lib';

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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
                      isActive={isSidebarItemActive(pathname, item)}
                    >
                      <span>
                        <item.icon className="h-4 w-4" />
                        {item.url.type === 'url' ? (
                          <Link to={item.url.path}>{item.title}</Link>
                        ) : (
                          <span>{item.title}</span>
                        )}
                      </span>
                    </SidebarMenuButton>

                    {item.items !== undefined && (
                      <SidebarMenuSub>
                        {item.items.map(subItem => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSidebarItemActive(pathname, subItem)}
                            >
                              <span>
                                {subItem.url.type === 'url' ? (
                                  <Link to={subItem.url.path}>
                                    {subItem.title}
                                  </Link>
                                ) : (
                                  <span>{subItem.title}</span>
                                )}
                              </span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
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
