'use client';

import { useState } from 'react';

export function Pricing() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="pricing" className="w-full bg-[#F0F2F5] py-28 px-6 sm:px-12 md:px-16 border-t border-[#0A1628]/[0.12]">
      <div className="max-w-[1400px] mx-auto">

        {/* Section Header */}
        <div className="flex items-center gap-4 mb-20">
          <div className="w-8 h-[1px] bg-[#0A1628]/30" />
          <span className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-[0.2em]">
            Preços
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[1px] bg-[#0A1628]/[0.12] border border-[#0A1628]/[0.12]">

          {/* Early Access Card */}
          <div className="bg-white p-10 flex flex-col items-start h-full">
            <div className="flex items-center gap-2 mb-10 px-3 py-1 border border-[#0A1628]/10">
              <div className="size-1.5 bg-[#0A1628] opacity-40 animate-pulse" />
              <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#0A1628]/40">
                Acesso Limitado
              </span>
            </div>

            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#0A1628]/30 mb-4">
              Early Access
            </span>

            <div className="flex items-baseline gap-4 mb-8">
              <h3 className="font-['Libre_Baskerville'] text-[64px] leading-none text-[#0A1628]">
                R$0
              </h3>
              <div className="flex flex-col">
                <span className="font-['Libre_Baskerville'] text-xl text-[#0A1628]/30 line-through">
                  R$49,99
                </span>
                <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#0A1628]/30">
                  por mês
                </span>
              </div>
            </div>

            <p className="font-['Figtree'] text-[15px] leading-relaxed text-[#0A1628]/50 mb-10 max-w-[400px]">
              Para anestesistas integrados durante a fase de lançamento. Até <span className="text-[#0A1628]/80 font-medium">100 cirurgias por mês</span> com todas as funcionalidades assistenciais liberadas.
            </p>

            <ul className="flex flex-col gap-4 mb-12">
              {[
                'Avaliação pré-anestésica completa',
                'Até 100 pacientes/mês',
                'Implantação assistida',
                'Suporte direto via canal exclusivo',
              ].map((item) => (
                <li key={item} className="flex items-center gap-4 font-['Figtree'] text-[14px] text-[#0A1628]/60">
                  <div className="w-4 h-[1px] bg-[#0A1628]/20" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto w-full">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="w-full py-5 bg-[#0A1628] text-white font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest transition-all hover:bg-[#0A1628]/90"
              >
                Garantir Vaga Gratuita
              </button>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="bg-white p-10 flex flex-col items-start h-full">
            <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#0A1628]/30 mb-14 mt-2">
              Institucional
            </span>

            <h3 className="font-['Libre_Baskerville'] text-[42px] leading-none text-[#0A1628] mb-8">
              Sob Consulta
            </h3>

            <p className="font-['Figtree'] text-[15px] leading-relaxed text-[#0A1628]/50 mb-10 max-w-[400px]">
              Configurações customizadas para hospitais e grandes centros cirúrgicos com <span className="text-[#0A1628]/80 font-medium">volume ilimitado</span> de procedimentos. Precificação personalizada, SLA dedicado e implantação assistida.
            </p>

            {submitted ? (
              <div className="flex flex-col items-start gap-4 py-8 border-t border-[#0A1628]/10 w-full mt-auto">
                <div className="size-2 bg-[#2EBA8A]" />
                <span className="font-['Figtree'] text-sm text-[#0A1628]/60 font-light">
                  Recebemos sua solicitação institucional. Nossa equipe entrará em contato em breve.
                </span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full mt-auto">
                <div className="space-y-[1px] bg-[#0A1628]/[0.12] border border-[#0A1628]/[0.12]">
                  <input
                    type="text"
                    placeholder="NOME COMPLETO"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-white px-4 py-4 text-[#0A1628] placeholder:text-[#0A1628]/20 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest outline-none transition-colors focus:bg-[#F0F2F5]"
                  />
                  <input
                    type="email"
                    placeholder="EMAIL INSTITUCIONAL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-white px-4 py-4 text-[#0A1628] placeholder:text-[#0A1628]/20 font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest outline-none transition-colors focus:bg-[#F0F2F5]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-5 border border-[#0A1628] text-[#0A1628] font-['JetBrains_Mono'] text-[11px] uppercase tracking-widest transition-all hover:bg-[#0A1628] hover:text-white"
                >
                  Falar com especialista
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
