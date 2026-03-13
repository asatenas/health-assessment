import { cookies } from 'next/headers';
import { GoldenHourVariant } from '@/components/landing/golden-hour/golden-hour-page';
import { DuskProtocolVariant } from '@/components/landing/dusk-protocol/dusk-protocol-page';
import { ClinicalWhiteVariant } from '@/components/landing/clinical-white/clinical-white-page';
import { AnalyticsTracker } from '@/components/landing/analytics-tracker';
import { CookieConsentBanner } from '@/components/landing/cookie-consent-banner';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const variantCookie = cookieStore.get('landing-variant')?.value || '';

  // Fallback to variant A if cookie is missing/invalid
  const variant = ['A', 'D', 'E'].includes(variantCookie) ? variantCookie : 'A';

  return (
    <>
      <AnalyticsTracker variant={variant} />
      <CookieConsentBanner variant={variant as 'A' | 'D' | 'E'} />

      {/* Global CSS noise overlay required by gemini.md */}
      <div
        className="pointer-events-none fixed inset-0 z-[1000]"
        style={{
          opacity: variant === 'A' ? 0.02 : variant === 'D' ? 0.03 : 0.016,
          mixBlendMode: variant === 'D' ? 'overlay' : 'normal',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute inset-0 size-full"
        >
          <filter id="noise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="4"
              stitchTiles="stitch"
            />
          </filter>
          <rect
            width="100%"
            height="100%"
            filter="url(#noise)"
            opacity="1"
            fill="transparent"
          />
        </svg>
      </div>

      {variant === 'A' && <GoldenHourVariant />}
      {variant === 'D' && <DuskProtocolVariant />}
      {variant === 'E' && <ClinicalWhiteVariant />}
    </>
  );
}
