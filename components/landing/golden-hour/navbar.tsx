'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'py-4' : 'py-8 md:py-10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-center items-center group">
        <div
          className={`flex items-center justify-start gap-10 px-6 py-3 rounded-full transition-colors duration-500 ease-out border w-auto ${
            scrolled
              ? 'bg-[#f5f4f0]/80 backdrop-blur-xl border-[#1a1d24]/10 shadow-sm'
              : 'bg-transparent border-transparent'
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-[1.15rem] font-bold tracking-tight text-[#1a1d24] font-['Fraunces'] uppercase flex items-center gap-2 shrink-0"
          >
            Asatenas
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide uppercase font-['Albert_Sans'] text-[#1a1d24]/60">
            <button
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="uppercase hover:text-[#1a1d24] transition-colors hover:-translate-y-px duration-250"
            >
              Solução
            </button>
            <button
              onClick={() => document.getElementById('metrics')?.scrollIntoView({ behavior: 'smooth' })}
              className="uppercase hover:text-[#1a1d24] transition-colors hover:-translate-y-px duration-250"
            >
              Impacto
            </button>
            <Link href="/login" target="_blank" rel="noopener noreferrer" className="hover:text-[#1a1d24] transition-colors translate-y-0 hover:-translate-y-px duration-250">
              Acessar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
