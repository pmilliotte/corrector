import { createContext, Dispatch, SetStateAction, useContext } from 'react';

import { AppRoute } from '../constants';

export type Breadcrumb = { label: string; linkTo?: string | AppRoute }[];
export type BreadcrumbContextType = {
  breadcrumb: Breadcrumb;
  setBreadcrumb?: Dispatch<SetStateAction<Breadcrumb>>;
};

export const BreadcrumbContext = createContext<BreadcrumbContextType>({
  breadcrumb: [],
});

export const useBreadcrumbContext = (): BreadcrumbContextType =>
  useContext(BreadcrumbContext);
