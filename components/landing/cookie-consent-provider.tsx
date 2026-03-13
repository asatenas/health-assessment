'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  type ConsentValue,
  getConsentValue,
  setConsentValue,
} from '@/lib/landing/cookie-consent';

interface CookieConsentContext {
  consent: ConsentValue | null;
  accept: () => void;
  reject: () => void;
}

const CookieConsentContext = createContext<CookieConsentContext | null>(null);

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsent(getConsentValue());
  }, []);

  const accept = useCallback(() => {
    setConsentValue('granted');
    setConsent('granted');
  }, []);

  const reject = useCallback(() => {
    setConsentValue('denied');
    setConsent('denied');
  }, []);

  return (
    <CookieConsentContext.Provider value={{ consent, accept, reject }}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent(): CookieConsentContext {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      'useCookieConsent must be used within CookieConsentProvider',
    );
  }
  return ctx;
}
