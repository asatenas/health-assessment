const COOKIE_NAME = 'analytics-consent';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 365 days in seconds

export type ConsentValue = 'granted' | 'denied';

export function getConsentValue(): ConsentValue | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const value = match.split('=')[1];
  if (value === 'granted' || value === 'denied') return value;
  return null;
}

export function setConsentValue(value: ConsentValue): void {
  document.cookie = `${COOKIE_NAME}=${value}; max-age=${COOKIE_MAX_AGE}; path=/; SameSite=Lax`;
}

export function hasAnalyticsConsent(): boolean {
  return getConsentValue() === 'granted';
}
