import {
  IntlShape,
  MessageDescriptor,
  useIntl as useReactIntl,
} from 'react-intl';

export const useIntl = (
  options: Partial<MessageDescriptor> = {},
): IntlShape & {
  t: (id: string, values?: Record<string, number | string>) => string;
} => {
  const intl = useReactIntl();

  const t = (id: string, values?: Record<string, number | string>): string =>
    intl.formatMessage(
      {
        id,
        ...options,
      },
      values,
    );

  return { t, ...intl };
};
