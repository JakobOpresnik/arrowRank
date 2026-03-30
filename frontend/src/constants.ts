import type { Language } from './types';

// const isDev: boolean = import.meta.env.MODE === 'development';

export const BE_BASE_URL: string = import.meta.env.VITE_BACKEND_URL;
export const FE_VITE_URL: string = import.meta.env.VITE_FRONTEND_URL;

export const BOW_CATEGORIES: string[] = [
  'All',
  'Barebow',
  'Long bow',
  'Traditional bow',
  'Primitive bow',
  'Guest',
];
export const AGE_GROUPS: string[] = ['All', 'U11', 'U16', 'Adults'];
export const GENDER_OPTIONS: string[] = ['All', 'Male', 'Female', 'Mixed'];

/*
  languages
*/
export const SUPPORTED_LANGUAGES: string[] = ['en', 'sl', 'hr', 'de', 'it'];
export const DEFAULT_LANGUAGE: Language = 'en';

// const COUNTRY_FLAG_BASE_PATH = '/src/assets/country_flag_icons';
const COUNTRY_FLAG_BASE_PATH = './country_flag_icons';
export const LANGUAGE_FLAGS: Record<Language, string> = {
  en: `${COUNTRY_FLAG_BASE_PATH}/united-kingdom.svg`,
  sl: `${COUNTRY_FLAG_BASE_PATH}/slovenia.svg`,
  hr: `${COUNTRY_FLAG_BASE_PATH}/croatia.svg`,
  de: `${COUNTRY_FLAG_BASE_PATH}/germany.svg`,
  it: `${COUNTRY_FLAG_BASE_PATH}/italy.svg`,
};

export const TARGET_TOTAL_SCORE = 28;
