"use client";

import { SignupForm } from '@/components/landing/signup-form';

export function Hero() {
  return (
    <div className="flex flex-col">
      {/* Kicker label */}
      <div className="flex items-center gap-0 mb-8">
        <div className="h-[1px] w-6 bg-[#0A1628]/30 mr-4" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#0A1628]/50 font-medium">
          Plataforma de Anestesia
        </span>
      </div>

      {/* Headline (Libre Baskerville) */}
      <h1 className="font-['Libre_Baskerville'] text-[56px] sm:text-[72px] lg:text-[84px] leading-[1.05] tracking-[-0.02em] text-[#0A1628] mb-12 max-w-[600px]">
        Pré-anestesia<br />
        <span className="italic text-[#0A1628]/50 font-normal">com IA.</span>
      </h1>

      {/* Divider */}
      <div className="w-full max-w-[540px] h-[1px] bg-[#0A1628]/[0.12] mb-10" />

      {/* Body text */}
      <p className="font-['Figtree'] text-[15px] leading-[1.8] text-[#0A1628]/50 mb-14 max-w-[480px]">
        Automatize a coleta de dados pré-operatórios com nosso modelo. Mais segurança e qualidade para o paciente, menos tarefas redundantes para você.
      </p>

      {/* Sharp CTA Form */}
      <div className="w-full relative">
        <SignupForm variant="clinical-white" />
      </div>
    </div>
  );
}
