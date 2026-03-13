'use client';

import { useEffect } from 'react';
import {
  trackPageView,
  trackScroll,
  trackTimeOnPage,
} from '@/lib/landing/analytics';
import { useCookieConsent } from './cookie-consent-provider';

export function AnalyticsTracker({ variant }: { variant: string }) {
  const { consent } = useCookieConsent();

  useEffect(() => {
    if (consent !== 'granted') return;

    // Track initial page view
    trackPageView(variant);

    // Track time on page
    const intervals = [15, 30, 60, 120, 300]; // seconds
    const timers = intervals.map((seconds) =>
      setTimeout(() => trackTimeOnPage(variant, seconds), seconds * 1000),
    );

    // Track scroll depth
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      const scrollPercentage = Math.round(
        ((scrollTop + windowHeight) / documentHeight) * 100,
      );

      const depths = [25, 50, 75, 100];
      depths.forEach((depth) => {
        const key = `scroll_${depth}`;
        if (scrollPercentage >= depth && !window.sessionStorage.getItem(key)) {
          window.sessionStorage.setItem(key, 'true');
          trackScroll(variant, depth);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [consent, variant]);

  return null;
}
