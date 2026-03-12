import { track } from '@vercel/analytics';

export function trackPageView(variant: string) {
  track('page_view', { variant });
}

export function trackScroll(variant: string, depth: number) {
  track('scroll_depth', { variant, depth });
}

export function trackCTAClick(variant: string, ctaId: string) {
  track('cta_click', { variant, ctaId });
}

export function trackTimeOnPage(variant: string, seconds: number) {
  track('time_on_page', { variant, seconds });
}

export function trackSignup(variant: string) {
  track('signup_success', { variant });
}
