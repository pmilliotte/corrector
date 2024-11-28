import flatMapDeep from 'lodash/flatMapDeep';
import { BookCheck, Network, Settings, Users } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { AppRoute } from '../constants';
import { SidebarGroup, SidebarItem } from '../types';
import { isSidebarItemActive, useIntl } from '../utils';

export const useSidebarItems = (): {
  selectedItemTitle?: string[];
  groups: SidebarGroup[];
} => {
  const t = useIntl();
  const { pathname } = useLocation();
  const groups: SidebarGroup[] = [
    {
      title: t.formatMessage({ id: 'common.sidebar.organization' }),
      displayTitle: true,
      items: [
        {
          title: t.formatMessage({ id: 'common.sidebar.people' }),
          url: { type: 'url', path: AppRoute.People },
          icon: Users,
        },
        {
          title: t.formatMessage({ id: 'common.sidebar.divisions' }),
          url: { type: 'url', path: AppRoute.Divisions },
          icon: Network,
        },
      ],
    },
    {
      title: t.formatMessage({ id: 'common.sidebar.documents' }),
      displayTitle: true,
      items: [
        {
          title: t.formatMessage({ id: 'common.sidebar.exams.title' }),
          icon: BookCheck,
          disableActive: true,
          url: { type: 'url', path: AppRoute.Exams },
          items: [
            {
              title: t.formatMessage({ id: 'common.sidebar.exams.list' }),
              breadcrumbItems: [
                t.formatMessage({ id: 'common.sidebar.exams.title' }),
                t.formatMessage({ id: 'common.sidebar.exams.list' }),
              ],
              url: { type: 'url', path: AppRoute.Exams },
            },
            {
              title: t.formatMessage({ id: 'common.sidebar.exams.edit' }),
              breadcrumbItems: [
                t.formatMessage({ id: 'common.sidebar.exam' }),
                t.formatMessage({ id: 'common.sidebar.exams.edit' }),
              ],
              url: {
                type: 'regexp',
                path: new RegExp(
                  `^${AppRoute.Exams}/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$`,
                ),
              },
            },
          ],
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
          url: { type: 'url', path: AppRoute.Settings },
          icon: Settings,
        },
      ],
    },
  ];

  // @ts-expect-error : flatMap is crazy
  const selectedItem = flatMapDeep<SidebarGroup, SidebarItem>(groups, group =>
    group.items.map(item => [item, ...(item.items ?? [])]),
  ).find(item => isSidebarItemActive(pathname, item));

  const selectedItemTitle =
    selectedItem?.breadcrumbItems ??
    (selectedItem?.title !== undefined ? [selectedItem.title] : undefined);

  return { selectedItemTitle, groups };
};
