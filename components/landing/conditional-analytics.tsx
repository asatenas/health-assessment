'use client';

import { Analytics } from '@vercel/analytics/next';
import { usePathname } from 'next/navigation';
import { hasAnalyticsConsent } from '@/lib/landing/cookie-consent';

export function ConditionalAnalytics() {
  const pathname = usePathname();
  const isLandingPage = pathname === '/';

  if (isLandingPage && !hasAnalyticsConsent()) {
    return null;
  }

  return <Analytics />;
}
