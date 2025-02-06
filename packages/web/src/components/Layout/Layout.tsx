import { Fragment, ReactElement, useState } from 'react';
import { Link, Outlet } from 'react-router-dom';

import {
  AppRoute,
  BreadcrumbContext,
  Breadcrumb as BreadcrumbType,
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
} from '../ui';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children?: ReactElement;
}

export const Layout = ({ children }: LayoutProps): ReactElement => {
  const { groups } = useSidebarItems();
  const { setSelectedOrganizationId, userOrganizations } = useOrganizations();
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbType>([]);

  return (
    <SidebarProvider>
      <AppSidebar
        groups={groups}
        setSelectedOrganizationId={setSelectedOrganizationId}
        userOrganizations={userOrganizations}
      />
      <BreadcrumbContext.Provider value={{ breadcrumb, setBreadcrumb }}>
        <SidebarInset className="min-w-0">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map(({ label, linkTo }, index) => (
                  <Fragment key={index}>
                    {index !== 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem>
                      {linkTo === undefined ? (
                        <BreadcrumbPage>{label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link to={AppRoute.Home}>{label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </header>
          {userOrganizations === undefined ? (
            <></>
          ) : (
            <UserOrganizationsContext.Provider value={userOrganizations}>
              {children ?? <Outlet />}
            </UserOrganizationsContext.Provider>
          )}
        </SidebarInset>
      </BreadcrumbContext.Provider>
    </SidebarProvider>
  );
};
