import { I18n } from 'i18n';

export const i18n = new I18n({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  directory: `${process.env.LOCALES_PATH}/locales`,
  updateFiles: false,
});
