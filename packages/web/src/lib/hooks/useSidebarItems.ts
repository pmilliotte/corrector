import flatMapDeep from 'lodash/flatMapDeep';
import { FileInput, List, Network, Plus, Settings } from 'lucide-react';
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
          title: 'Établissements / classes',
          url: { type: 'url', path: AppRoute.Classrooms },
          icon: Network,
        },
        {
          title: 'Examens assignés',
          url: { type: 'url', path: AppRoute.AssignedExams },
          icon: FileInput,
        },
      ],
    },
    {
      title: t.formatMessage({ id: 'common.sidebar.documents' }),
      displayTitle: true,
      items: [
        {
          title: 'Liste des examens',
          url: { type: 'url', path: AppRoute.Exams },
          icon: List,
        },
        {
          title: 'Créer un examen',
          url: { type: 'url', path: AppRoute.CreateExam },
          icon: Plus,
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
