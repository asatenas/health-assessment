'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-200 bg-white ${
        scrolled ? 'border-b border-[#0A1628]/[0.12] py-4' : 'py-8'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#0A1628] font-['Libre_Baskerville'] uppercase flex items-center gap-3"
        >
          Asatenas
        </Link>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-12 text-[11px] font-medium tracking-[0.2em] uppercase font-['JetBrains_Mono'] text-[#0A1628]/50">
          <Link href="#features" className="hover:text-[#0A1628] transition-colors">
            Solução
          </Link>
          <Link href="/login" className="hover:text-[#0A1628] transition-colors">
            Acesso Restrito
          </Link>
        </nav>

        {/* CTA (Sharp NO radius) */}
        <button
          onClick={() => document.getElementById('signup')?.focus()}
          className="bg-[#0A1628] hover:bg-[#0A1628]/80 text-white text-[11px] font-medium uppercase tracking-[0.15em] font-['JetBrains_Mono'] px-6 py-3 transition-colors rounded-none"
        >
          Acesso Antecipado
        </button>
      </div>
    </header>
  );
}
