import { SidebarItem } from '../types';

export const isSidebarItemActive = (
  pathname: string,
  sidebarItem: Omit<SidebarItem, 'icon'>,
): boolean =>
  sidebarItem.disableActive !== true &&
  (sidebarItem.url.type === 'url'
    ? pathname === (sidebarItem.url.path as string)
    : sidebarItem.url.path.test(pathname));
