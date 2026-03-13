"use client";

import { SignupForm } from '@/components/landing/signup-form';

export function Hero() {
  return (
    <div className="flex flex-col pt-16 md:pt-24 lg:pt-32 max-w-[460px]">
      {/* Kicker label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-6 bg-[#1a1d24]/35" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#1a1d24]/35 font-medium">
          Sistema de Gestão
        </span>
      </div>

      {/* Four-line Fraunces headline */}
      <h1 className="font-['Fraunces'] text-5xl sm:text-6xl lg:text-[76px] leading-[1.05] tracking-[-0.02em] text-[#1a1d24] mb-8">
        <span className="block opacity-90">Recupere</span>
        <span className="block opacity-90">milhões.</span>
        <span className="block text-[#b87333] font-light italic mt-1">
          Reduza
        </span>
        <span className="block opacity-45 font-light italic">
          cancelamentos.
        </span>
      </h1>

      {/* Body text */}
      <p className="font-['DM_Sans'] text-base md:text-[17px] leading-relaxed text-[#1a1d24]/45 mb-10 max-w-[420px] font-light">
        A plataforma de avaliação de saúde pré-operatória projetada para identificar riscos precocemente.
        Mantenha suas salas cirúrgicas funcionando com precisão absoluta.
      </p>

      {/* CTA section with email form */}
      <div className="w-full relative mt-4">
        <SignupForm variant="golden-hour" />
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 mt-4 tracking-wider">
          Apenas 50 vagas no grupo beta
        </p>
      </div>
    </div>
  );
}
