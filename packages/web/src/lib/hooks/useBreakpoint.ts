import { createBreakpoint } from 'react-use';
import tailwindConfig from 'tailwind.config.js';
import resolveConfig from 'tailwindcss/resolveConfig';

const config = resolveConfig(tailwindConfig);

export const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

export const breakpointsObject = BREAKPOINTS.reduce(
  (acc, breakpoint) => ({
    ...acc,
    [breakpoint]: Number.parseInt(config.theme.screens[breakpoint]),
  }),
  {},
);

export const useBreakpoint = createBreakpoint(
  breakpointsObject,
) as () => Breakpoint;
