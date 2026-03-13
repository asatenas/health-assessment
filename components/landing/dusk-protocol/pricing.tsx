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
    <section
      id="pricing"
      className="w-full relative z-10 py-24 px-6 sm:px-12 md:px-16 border-t border-[#F0ECE4]/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex items-center gap-4 mb-16">
          <div className="h-[1px] w-6 bg-[#D4906A]" />
          <span className="font-['Albert_Sans'] text-[11px] uppercase tracking-[0.2em] text-[#D4906A] font-medium">
            Preços
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Early Access Card */}
          <div className="relative p-8 rounded-[20px] bg-[rgba(212,144,106,0.08)] border border-[rgba(212,144,106,0.2)] overflow-hidden group flex flex-col">
            {/* Limited badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(212,144,106,0.15)] border border-[rgba(212,144,106,0.3)] mb-8">
              <div className="size-1.5 rounded-full bg-[#D4906A] animate-pulse" />
              <span className="font-['Albert_Sans'] text-[10px] uppercase tracking-widest text-[#D4906A] font-medium">
                Vagas Limitadas
              </span>
            </div>

            <div className="mb-2">
              <span className="font-['Albert_Sans'] text-[11px] uppercase tracking-widest text-[#6A6080]">
                Acesso Antecipado
              </span>
            </div>

            {/* Slashed price + free */}
            <div className="flex items-end gap-4 mb-6">
              <div className="font-['Spectral'] text-[56px] leading-none text-[#F0ECE4] font-light tracking-tight">
                R$0
              </div>
              <div className="flex flex-col pb-2 gap-1">
                <span className="font-['Spectral'] text-xl text-[#6A6080] line-through font-light">
                  R$49,99
                </span>
                <span className="font-['Albert_Sans'] text-[11px] text-[#6A6080] uppercase tracking-wider">
                  por mês
                </span>
              </div>
            </div>

            <p className="font-['DM_Sans'] text-[14px] text-[#6A6080] font-light leading-relaxed mb-8 max-w-[380px]">
              Até <span className="text-[#F0ECE4]">100 cirurgias por mês</span>,
              avaliação pré-anestésica completa, suporte dedicado e acesso a
              todas as funcionalidades durante o período inicial.
            </p>

            <ul className="flex flex-col gap-3 mb-0">
              {[
                'Avaliação pré-anestésica completa',
                'Até 100 cirurgias/mês',
                'Integração imediata',
                'Sem mudanças no seu fluxo atual',
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 font-['DM_Sans'] text-sm text-[#F0ECE4]/70 font-light"
                >
                  <div className="size-1.5 rounded-full bg-[#D4906A] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-auto pt-10">
              <button
                type="button"
                onClick={() => document.getElementById('signup')?.focus()}
                className="w-full py-4 rounded-[12px] bg-[linear-gradient(135deg,rgba(212,144,106,1)_0%,rgba(170,105,71,1)_100%)] text-[#181622] text-[12px] font-semibold uppercase tracking-wider font-['Albert_Sans'] transition-all hover:-translate-y-[2px]"
                style={{
                  boxShadow: '0 4px 24px rgba(212,144,106,0.25)',
                  transitionTimingFunction:
                    'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  transitionDuration: '0.25s',
                }}
              >
                Garantir Vaga Gratuita
              </button>
            </div>
          </div>

          {/* Enterprise Card */}
          <div className="p-8 rounded-[20px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] relative overflow-hidden flex flex-col">
            <div className="mb-8">
              <span className="font-['Albert_Sans'] text-[11px] uppercase tracking-widest text-[#6A6080]">
                Institucional
              </span>
            </div>

            <div className="mb-2">
              <span className="font-['Spectral'] text-[40px] leading-none text-[#F0ECE4] font-light tracking-tight">
                Sob Consulta
              </span>
            </div>

            <p className="font-['DM_Sans'] text-[14px] text-[#6A6080] font-light leading-relaxed mt-4 mb-8 max-w-[380px]">
              Configurações customizadas para hospitais e grandes centros
              cirúrgicos com{' '}
              <span className="text-[#F0ECE4]">volume ilimitado</span> de
              procedimentos. Precificação personalizada, SLA dedicado e
              implantação assistida.
            </p>

            {submitted ? (
              <div className="flex flex-col items-start gap-2 py-6 mt-auto">
                <div className="size-2 rounded-full bg-emerald-400" />
                <span className="font-['DM_Sans'] text-sm text-[#F0ECE4]/60 font-light">
                  Recebemos seu contato. Nossa equipe responderá em até 24h.
                </span>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 mt-auto"
              >
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(212,144,106,0.4)] rounded-[10px] px-4 py-3 text-[#F0ECE4] placeholder:text-[#6A6080] font-['DM_Sans'] text-sm font-light outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Email institucional"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] focus:border-[rgba(212,144,106,0.4)] rounded-[10px] px-4 py-3 text-[#F0ECE4] placeholder:text-[#6A6080] font-['DM_Sans'] text-sm font-light outline-none transition-colors"
                />
                <button
                  type="submit"
                  className="w-full py-4 rounded-[12px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] hover:border-[rgba(212,144,106,0.3)] text-[#F0ECE4] text-[12px] font-medium uppercase tracking-wider font-['Albert_Sans'] transition-all hover:-translate-y-[1px] mt-2"
                  style={{
                    transitionTimingFunction:
                      'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    transitionDuration: '0.25s',
                  }}
                >
                  Falar com nossa equipe
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
