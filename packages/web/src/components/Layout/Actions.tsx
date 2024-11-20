import { signOut } from '@aws-amplify/auth';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { QueryClientContext } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui';

export const Actions = (): React.ReactElement => {
  const posthog = usePostHog();
  const queryClient = useContext(QueryClientContext);

  const signout = async () => {
    await signOut({ global: true });
    await queryClient?.invalidateQueries({ queryKey: ['authSession'] });
    posthog.reset();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary">
          <DotsHorizontalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={signout}
          className="text-red-600 hover:cursor-pointer"
        >
          <FormattedMessage id="common.logout" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
