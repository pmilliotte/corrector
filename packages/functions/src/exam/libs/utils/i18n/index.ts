import { I18n } from 'i18n';
import path from 'path';

console.log('path', path.join('./', 'locales'));
console.log('path', path.resolve(__dirname, './locales'));

export const i18n = new I18n({
  locales: ['en', 'fr'],
  defaultLocale: 'fr',
  directory: path.resolve(__dirname, './locales'),
});
