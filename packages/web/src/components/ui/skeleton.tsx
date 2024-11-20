import { HTMLAttributes, ReactElement } from 'react';

import { cn } from '~/lib/utils';

const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement => (
  <div
    className={cn('animate-pulse rounded-md bg-primary/10', className)}
    {...props}
  />
);

export { Skeleton };
