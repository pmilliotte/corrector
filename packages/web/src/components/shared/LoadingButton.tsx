import { Loader2, LucideIcon } from 'lucide-react';
import { ReactElement } from 'react';

import { Button, ButtonProps } from '../ui';

type LoadingButtonProps = {
  label: string;
  Icon: LucideIcon;
  loading: boolean;
  iconPosition?: 'left' | 'right';
} & ButtonProps;

export const LoadingButton = ({
  label,
  Icon,
  loading,
  iconPosition = 'right',
  ...buttonProps
}: LoadingButtonProps): ReactElement => (
  <Button className="flex items-center gap-2" {...buttonProps}>
    <span>{iconPosition === 'right' && label}</span>
    {loading ? (
      <Loader2 className="animate-spin" size={16} />
    ) : (
      <Icon size={16} />
    )}
    <span>{iconPosition === 'left' && label}</span>
  </Button>
);
