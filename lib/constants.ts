import { generateDummyPassword } from './db/utils';

export const isProductionEnvironment = process.env.NODE_ENV === 'production';
export const isDevelopmentEnvironment = process.env.NODE_ENV === 'development';
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT,
);

export const postgres_url = isDevelopmentEnvironment
  ? process.env.POSTGRES_URL_DEV
  : process.env.POSTGRES_URL;

export const guestRegex = /^guest-\d+$/;

export const DUMMY_PASSWORD = generateDummyPassword();

export const APP_URL = isDevelopmentEnvironment
  ? `http://${process.env.APP_URL_DEV}`
  : isProductionEnvironment
    ? `https://${process.env.APP_URL_PROD}`
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
