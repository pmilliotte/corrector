import flatMap from 'lodash/flatMap';
import { Network, Settings, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { AppRoute } from '../constants';
import { SidebarGroup, SidebarItem } from '../types';
import { useIntl } from '../utils';

export const useSidebarItems = (): {
  selectedItemTitle?: string;
  groups: SidebarGroup[];
} => {
  const t = useIntl();
  const { pathname } = useLocation();
  const groups: SidebarGroup[] = [
    {
      className: '',
      title: t.formatMessage({ id: 'common.sidebar.organization' }),
      displayTitle: true,
      items: [
        {
          title: t.formatMessage({ id: 'common.sidebar.people' }),
          url: AppRoute.People,
          icon: Users,
        },
        {
          title: t.formatMessage({ id: 'common.sidebar.divisions' }),
          url: AppRoute.Divisions,
          icon: Network,
        },
      ],
    },
    {
      className: 'mt-auto',
      title: 'settings',
      displayTitle: false,
      items: [
        {
          title: t.formatMessage({ id: 'common.settings' }),
          url: AppRoute.Settings,
          icon: Settings,
        },
      ],
    },
  ];

  // @ts-expect-error : flatMap is crazy
  const selectedItemTitle = flatMap<SidebarGroup, SidebarItem>(
    groups,
    'items',
  ).find(item => pathname === (item.url as string))?.title;

  return { selectedItemTitle, groups };
};
