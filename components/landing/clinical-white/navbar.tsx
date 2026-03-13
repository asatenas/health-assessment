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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 flex items-center justify-between md:justify-start">
        {/* Left: Logo */}
        <div className="flex-1 shrink-0">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xl font-bold tracking-tight text-[#0A1628] font-['Libre_Baskerville'] uppercase inline-flex items-center gap-3"
          >
            Asatenas
          </button>
        </div>

        {/* Center: Desktop Nav Links (hidden on mobile) */}
        <nav className="hidden md:flex flex-1 justify-center items-center gap-12 text-[11px] font-medium tracking-[0.2em] uppercase font-['JetBrains_Mono'] text-[#0A1628]/50">
          <button
            type="button"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="uppercase hover:text-[#0A1628] transition-colors"
          >
            Solução
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            className="uppercase hover:text-[#0A1628] transition-colors"
          >
            Preços
          </button>
          <Link href="/login" target="_blank" rel="noopener noreferrer" className="hover:text-[#0A1628] transition-colors">
            Acessar Plataforma
          </Link>
        </nav>

        {/* Right: Mobile Login Link (Desktop Empty Spacer) */}
        <div className="flex-1 flex justify-end">
          <Link
            href="/login"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden text-[11px] font-medium tracking-[0.2em] uppercase font-['JetBrains_Mono'] text-[#0A1628]/50 hover:text-[#0A1628] transition-colors"
          >
            Acessar Plataforma
          </Link>
        </div>
      </div>
    </header>
  );
}
