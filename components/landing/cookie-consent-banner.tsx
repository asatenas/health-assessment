'use client';

import { useEffect, useState } from 'react';
import { useCookieConsent } from './cookie-consent-provider';

type Variant = 'A' | 'D' | 'E';

const styles: Record<
  Variant,
  {
    container: string;
    text: string;
    strong: string;
    acceptBtn: string;
    rejectBtn: string;
  }
> = {
  A: {
    container: 'bg-[#1a1d24] border-t border-[#f5f4f0]/10',
    text: "font-['DM_Sans'] text-sm text-[#f5f4f0]/50",
    strong: 'text-[#f5f4f0]',
    acceptBtn:
      "bg-[#f5f4f0] text-[#1a1d24] text-[11px] font-['Albert_Sans'] tracking-wide uppercase rounded-full px-5 py-2 hover:bg-[#f5f4f0]/90 transition-colors whitespace-nowrap",
    rejectBtn:
      "border border-[#f5f4f0]/20 text-[#f5f4f0]/50 text-[11px] font-['Albert_Sans'] tracking-wide uppercase rounded-full px-5 py-2 hover:text-[#f5f4f0]/70 transition-colors whitespace-nowrap",
  },
  D: {
    container: 'bg-[#181622] border-t border-[#F0ECE4]/10',
    text: "font-['DM_Sans'] text-sm text-[#6A6080]",
    strong: 'text-[#F0ECE4]',
    acceptBtn:
      "bg-[#F0ECE4] text-[#181622] text-[11px] font-['Albert_Sans'] tracking-[0.1em] uppercase rounded-full px-5 py-2 hover:bg-[#F0ECE4]/90 transition-colors whitespace-nowrap",
    rejectBtn:
      "border border-[#F0ECE4]/10 text-[#6A6080] text-[11px] font-['Albert_Sans'] tracking-[0.1em] uppercase rounded-full px-5 py-2 hover:text-[#F0ECE4]/60 transition-colors whitespace-nowrap",
  },
  E: {
    container: 'bg-white border-t border-[#0A1628]/[0.12]',
    text: "font-['Figtree'] text-sm text-[#0A1628]/50",
    strong: 'text-[#0A1628]',
    acceptBtn:
      "bg-[#0A1628] text-white text-[11px] font-['JetBrains_Mono'] tracking-widest uppercase px-5 py-2 hover:bg-[#0A1628]/90 transition-colors whitespace-nowrap",
    rejectBtn:
      "border border-[#0A1628]/20 text-[#0A1628]/50 text-[11px] font-['JetBrains_Mono'] tracking-widest uppercase px-5 py-2 hover:text-[#0A1628] transition-colors whitespace-nowrap",
  },
};

export function CookieConsentBanner({ variant }: { variant: Variant }) {
  const { consent, accept, reject } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || consent !== null) return null;

  const s = styles[variant];

  return (
    <div className={`fixed bottom-0 inset-x-0 z-[999] ${s.container}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={s.text}>
          Usamos cookies para melhorar sua experiência. Ao aceitar, você
          concorda com nossa política de privacidade.
        </p>
        <div className="flex shrink-0 gap-3">
          <button type="button" className={s.rejectBtn} onClick={reject}>
            Recusar
          </button>
          <button type="button" className={s.acceptBtn} onClick={accept}>
            Aceitar
          </button>
        </div>
      </div>
    </div>
  );
}
