'use client';

import { useEffect, useState } from 'react';

const sparklineData = [
  [30, 45, 25, 60, 40, 75, 45],
  [60, 50, 70, 40, 55, 30, 80],
  [20, 35, 25, 40, 30, 50, 45],
];

export function DataRail() {
  const [activePulse, setActivePulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePulse((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex items-center gap-3 mb-6 px-2">
        <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#1a1d24]/40 font-semibold">
          Resultados
        </span>
      </div>

      {/* Card 1: Efficiency */}
      <DiagnosticCard
        title="Eficiência de Salas"
        status="ok"
        value="Otimizado"
        subtitle="Diminuição da ociosidade"
      />

      {/* Card 2: Clinical */}
      <DiagnosticCard
        title="Padrão Científico"
        status="ok"
        value="Validado"
        subtitle="Protocolos clínicos seguidos"
      />

      {/* Card 3: Risk */}
      <DiagnosticCard
        title="Risco de Adoção"
        status="ok"
        value="Zero"
        subtitle="Piloto sem impacto inicial"
      />
    </div>
  );
}

function DiagnosticCard({
  title,
  status,
  value,
  subtitle,
  isPulsing = false,
}: {
  title: string;
  status: 'ok' | 'warn' | 'alert';
  value: string;
  subtitle: string;
  isPulsing?: boolean;
}) {
  const statusColor = {
    ok: 'bg-emerald-500/80',
    warn: 'bg-amber-500/80',
    alert: 'bg-[#b87333]',
  }[status];

  return (
    <div className="group flex justify-between bg-[#f5f4f0]/60 p-5 border border-[#1a1d24]/[0.06] rounded-[6px] hover:border-[#b87333]/30 transition-all duration-300 transform hover:translate-x-1 cursor-default relative overflow-hidden">

      {/* Content */}
      <div className="flex flex-col z-10 w-full">
        <div className="flex items-center justify-between w-full mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className={`size-1.5 rounded-full ${statusColor}`} />
              {(status === 'warn' || status === 'alert') && isPulsing && (
                  <div className={`absolute inset-0 rounded-full ${statusColor} animate-ping opacity-75`} />
              )}
            </div>
            <span className="font-['JetBrains_Mono'] text-[9px] tracking-[0.15em] text-[#1a1d24]/40 uppercase font-medium">
              {title}
            </span>
          </div>
        </div>

        <div className="font-['Fraunces'] text-[28px] text-[#1a1d24] leading-none mb-2 tracking-tight">
          {value}
        </div>

        <div className="font-['DM_Sans'] text-xs text-[#1a1d24]/45 font-light relative">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
