import { LucideIcon } from 'lucide-react';

import { AppRoute } from '../constants';

export type SidebarItem = {
  title: string;
  url: AppRoute;
  icon: LucideIcon;
};
export type SidebarGroup = {
  title: string;
  items: SidebarItem[];
  className?: string;
  displayTitle: boolean;
};
