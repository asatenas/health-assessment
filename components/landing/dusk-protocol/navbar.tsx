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
          className={`flex items-center px-6 py-4 rounded-full transition-all duration-500 ease-out border w-full backdrop-blur-md ${
            scrolled
              ? 'bg-[#181622]/80 border-[#F0ECE4]/10 shadow-lg'
              : 'bg-[rgba(240,236,228,0.02)] border-[rgba(240,236,228,0.04)]'
          }`}
        >
          {/* Left: Logo */}
          <div className="flex-1 shrink-0 flex items-center">
            <Link
              href="/"
              className="text-[1.15rem] tracking-tight text-[#F0ECE4] font-['Spectral'] font-light uppercase flex items-center gap-2"
            >
              Asatenas
            </Link>
          </div>

          {/* Center: Desktop Nav Links (hidden on mobile) */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-10 text-[11px] font-medium tracking-[0.1em] uppercase font-['Albert_Sans'] text-[#6A6080]">
            <button
              type="button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="uppercase hover:text-[#F0ECE4] transition-colors translate-y-0 hover:-translate-y-px duration-250"
            >
              Solução
            </button>
            <Link href="/login" target="_blank" rel="noopener noreferrer" className="uppercase hover:text-[#F0ECE4] transition-colors translate-y-0 hover:-translate-y-px duration-250">
              Acessar Painel
            </Link>
          </nav>

          {/* Right: Mobile Login Link (Desktop Empty Spacer) */}
          <div className="flex-1 flex justify-end">
            <Link
              href="/login"
              target="_blank"
              rel="noopener noreferrer"
              className="md:hidden uppercase text-[11px] font-medium tracking-[0.1em] font-['Albert_Sans'] text-[#6A6080] hover:text-[#F0ECE4] transition-colors"
            >
              Acessar Painel
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
