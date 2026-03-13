"use client";

import { SignupForm } from '@/components/landing/signup-form';

export function Hero() {
  return (
    <div className="flex flex-col items-center text-center mx-auto max-w-[680px]">
      {/* Kicker label */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <div className="size-1.5 rounded-full bg-[#1a1d24]/20" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.25em] text-[#1a1d24]/50 font-medium">
          Sistema de Gestão
        </span>
        <div className="size-1.5 rounded-full bg-[#1a1d24]/20" />
      </div>

      {/* Four-line Fraunces headline */}
      <h1 className="font-['Fraunces'] text-[56px] sm:text-[72px] lg:text-[86px] leading-[1] tracking-[-0.03em] text-[#1a1d24] mb-10 w-full">
        <span className="block opacity-90">Reduza</span>
        <span className="block opacity-90">Cancelamentos.</span>
        <span className="block opacity-45 font-light italic mt-2">
          Recupere
        </span>
        <span className="block text-[#b87333] font-light italic">
          R$ 1.000.000s
        </span>
      </h1>

      {/* Body text */}
      <p className="font-['DM_Sans'] text-base md:text-[18px] leading-[1.65] text-[#1a1d24]/60 mb-12 max-w-[520px] font-light text-balance">
        A plataforma de avaliação de saúde pré-operatória projetada para identificar riscos precocemente.
        Mantenha suas salas cirúrgicas funcionando com precisão absoluta.
      </p>

      {/* CTA section with email form */}
      <div className="w-full flex flex-col items-center justify-center mt-4">
        <SignupForm variant="golden-hour" />
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 mt-5 tracking-[0.2em] text-center">
          Vagas limitadas
        </p>
      </div>
    </div>
  );
}
