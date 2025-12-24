/// <reference types="vite/client" />
import type { Language } from './types';

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
export const AGE_GROUPS: string[] = ['All', 'U10', 'U15', 'Adults'];
export const GENDER_OPTIONS: string[] = ['All', 'Male', 'Female', 'Mixed'];

/*
  languages
*/
export const SUPPORTED_LANGUAGES: string[] = ['en', 'sl'];
export const DEFAULT_LANGUAGE: Language = 'en';

const COUNTRY_FLAG_BASE_PATH = '/src/assets/country_flag_icons';

export const LANGUAGE_FLAGS: Record<string, string> = {
  en: `${COUNTRY_FLAG_BASE_PATH}/united-kingdom.png`,
  sl: `${COUNTRY_FLAG_BASE_PATH}/slovenia.png`,
};

export const TARGET_TOTAL_SCORE = 28;
