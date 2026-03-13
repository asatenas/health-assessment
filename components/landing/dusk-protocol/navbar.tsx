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
        scrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-16 flex justify-between items-center group">
        <div
          className={`flex items-center justify-between px-6 py-4 rounded-full transition-all duration-500 ease-out border w-full backdrop-blur-md ${
            scrolled
              ? 'bg-[#181622]/80 border-[#F0ECE4]/10 shadow-lg'
              : 'bg-[rgba(240,236,228,0.02)] border-[rgba(240,236,228,0.04)]'
          }`}
        >
          {/* Logo */}
          <Link
            href="/"
            className="text-[1.15rem] tracking-tight text-[#F0ECE4] font-['Spectral'] font-light uppercase flex items-center gap-2"
          >
            Asatenas
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-10 text-[11px] font-medium tracking-[0.1em] uppercase font-['Albert_Sans'] text-[#6A6080]">
            <Link href="#features" className="hover:text-[#F0ECE4] transition-colors translate-y-0 hover:-translate-y-px duration-250">
              Plataforma
            </Link>
            <Link href="/login" className="hover:text-[#F0ECE4] transition-colors translate-y-0 hover:-translate-y-px duration-250">
              Acessar Painel
            </Link>
          </nav>

          {/* CTA */}
          <button
            onClick={() => document.getElementById('signup')?.focus()}
            className="bg-[linear-gradient(135deg,rgba(212,144,106,1)__0%,rgba(170,105,71,1)_100%)] text-[#181622] text-[11px] font-semibold uppercase tracking-wider font-['Albert_Sans'] px-6 py-2.5 rounded-[8px] transition-all hover:-translate-y-[2px]"
            style={{
              boxShadow: '0 4px 24px rgba(212,144,106,0.2)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              transitionDuration: '0.25s'
            }}
          >
            Acesso Antecipado
          </button>
        </div>
      </div>
    </header>
  );
}
