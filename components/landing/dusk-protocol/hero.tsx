"use client";

import { SignupForm } from '@/components/landing/signup-form';

export function Hero() {
  return (
    <div className="flex flex-col">
      {/* Kicker label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-6 bg-[#D4906A]" />
        <span className="font-['Albert_Sans'] text-[11px] uppercase tracking-[0.2em] text-[#D4906A] font-medium">
          Protocolo Institucional
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-['Spectral'] text-5xl sm:text-6xl lg:text-[72px] leading-[1.1] tracking-[-0.01em] text-[#F0ECE4] mb-8 font-light max-w-[640px]">
        O futuro da <br className="hidden sm:block" />
        <span className="text-[#D4906A] italic font-light">
          gestão cirúrgica
        </span>
        <br className="hidden sm:block" />
        <span className="text-[#6A6080] italic ml-2 sm:ml-0 text-3xl sm:text-5xl lg:text-[56px]">
          precisão absoluta em escala.
        </span>
      </h1>

      {/* Body text */}
      <p className="font-['DM_Sans'] text-base md:text-[17px] leading-[1.7] text-[#6A6080] mb-12 max-w-[480px] font-light">
        Identifique riscos antes que eles cancelem suas cirurgias. Uma plataforma de avaliação unificada que conecta médicos, pacientes e infraestrutura.
      </p>

      {/* CTA section */}
      <div className="w-full relative mt-2">
        <SignupForm variant="dusk-protocol" />
      </div>
    </div>
  );
}

