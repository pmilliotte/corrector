import { Fragment, ReactElement } from 'react';
import { Link } from 'react-router-dom';

import {
  AppRoute,
  useOrganizations,
  UserOrganizationsContext,
  useSidebarItems,
} from '~/lib';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  Skeleton,
} from '../ui';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children?: ReactElement;
}

export const Layout = ({ children }: LayoutProps): ReactElement => {
  const { groups, selectedItemTitle } = useSidebarItems();
  const { setSelectedOrganizationId, userOrganizations } = useOrganizations();

  return (
    <SidebarProvider>
      <AppSidebar
        groups={groups}
        setSelectedOrganizationId={setSelectedOrganizationId}
        userOrganizations={userOrganizations}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {userOrganizations !== undefined ? (
                <BreadcrumbItem className="hidden md:block text-muted-foreground">
                  <BreadcrumbLink asChild>
                    <Link to={AppRoute.Home}>
                      {userOrganizations.selectedOrganization.name}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ) : (
                <Skeleton className="h-4 w-[100px]" />
              )}
              {selectedItemTitle?.map(title => (
                <Fragment key={title}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="p-4">
          {userOrganizations === undefined ? (
            <></>
          ) : (
            <UserOrganizationsContext.Provider value={userOrganizations}>
              {children}
            </UserOrganizationsContext.Provider>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
