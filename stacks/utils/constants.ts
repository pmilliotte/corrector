const DOMAIN = 'corrector.fr';
const APP_DOMAIN_PREFIX = 'app';

export const getDomain = (stage: string): string => {
  switch (stage) {
    case 'prod':
      return `${APP_DOMAIN_PREFIX}.${DOMAIN}`;
    case 'staging':
      return `${APP_DOMAIN_PREFIX}.staging.${DOMAIN}`;
    default:
      throw new Error(`Invalid stage: ${stage}`);
  }
};
