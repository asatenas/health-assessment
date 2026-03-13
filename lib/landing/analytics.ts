import { track } from '@vercel/analytics';
import { hasAnalyticsConsent } from './cookie-consent';

export function trackPageView(variant: string) {
  if (!hasAnalyticsConsent()) return;
  track('page_view', { variant });
}

export function trackScroll(variant: string, depth: number) {
  if (!hasAnalyticsConsent()) return;
  track('scroll_depth', { variant, depth });
}

export function trackCTAClick(variant: string, ctaId: string) {
  if (!hasAnalyticsConsent()) return;
  track('cta_click', { variant, ctaId });
}

export function trackTimeOnPage(variant: string, seconds: number) {
  if (!hasAnalyticsConsent()) return;
  track('time_on_page', { variant, seconds });
}

export function trackSignup(variant: string) {
  if (!hasAnalyticsConsent()) return;
  track('signup_success', { variant });
}
