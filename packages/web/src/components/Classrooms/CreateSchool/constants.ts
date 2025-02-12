import { z } from 'zod';

export const createSchoolFormSchema = z.object({
  name: z.string().min(1),
  uai: z.string().optional(),
  city: z.string(),
});

export const DEFAULT_CREATE_SCHOOL_FORM_VALUES = {
  name: '',
  uai: undefined,
  city: '',
};

export const DATA_GOUV_API_URL = `https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-adresse-et-geolocalisation-etablissements-premier-et-second-degre/records`;
export const searchNameFilter = (filter: string): string =>
  `search(appellation_officielle%2C%20%22${filter}%22)`;
export const postalCodeFilter = (filter: string): string =>
  `code_postal_uai%20%3D%20%22${filter}%22`;
export const SCHOOL_NATURE_FILTER = `nature_uai%20in%20(340%2C%20306%2C%20300%2C%20302%2C%20320%2C%20334)`;
export const ITEMS_LIMIT = 100;
