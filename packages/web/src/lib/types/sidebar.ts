import { LucideIcon } from 'lucide-react';

import { AppRoute } from '../constants';

export type SidebarItemWithoutLink = {
  title: string;
  disableActive?: boolean;
  icon: LucideIcon;
  items?: Omit<SidebarItem, 'icon'>[];
};

export type SidebarItem = {
  title: string;
  breadcrumbItems?: string[];
  disableActive?: boolean;
  url:
    | {
        type: 'regexp';
        path: RegExp;
      }
    | {
        type: 'url';
        path: AppRoute;
      };
  icon: LucideIcon;
  items?: Omit<SidebarItem, 'icon'>[];
};

export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  className?: string;
  displayTitle: boolean;
};
