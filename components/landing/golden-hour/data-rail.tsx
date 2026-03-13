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
        <div className="size-1.5 rounded-full bg-[#1a1d24]/20" />
        <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-widest text-[#1a1d24]/40 font-semibold">
          Telemetria do Sistema
        </span>
      </div>

      {/* Card 1: Alert */}
      <DiagnosticCard
        title="Ociosidade de Sala"
        status="alert"
        value="12.4%"
        subtitle="Média mensal de atrasos"
        sparkline={sparklineData[0]}
        isPulsing={activePulse === 0}
      />

      {/* Card 2: Warn */}
      <DiagnosticCard
        title="Risco HAS-2"
        status="warn"
        value="Elevado"
        subtitle="3 pacientes hoje"
        sparkline={sparklineData[1]}
        isPulsing={activePulse === 1}
      />

      {/* Card 3: OK */}
      <DiagnosticCard
        title="Taxa de Triagem"
        status="ok"
        value="98.2%"
        subtitle="Dentro da conformidade"
        sparkline={sparklineData[2]}
      />
    </div>
  );
}

function DiagnosticCard({
  title,
  status,
  value,
  subtitle,
  sparkline,
  isPulsing = false,
}: {
  title: string;
  status: 'ok' | 'warn' | 'alert';
  value: string;
  subtitle: string;
  sparkline: number[];
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
      <div className="flex flex-col z-10">
        <div className="flex items-center gap-2 mb-3">
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

        <div className="font-['Fraunces'] text-[28px] text-[#1a1d24] leading-none mb-2 tracking-tight">
          {value}
        </div>

        <div className="font-['DM_Sans'] text-xs text-[#1a1d24]/45 font-light relative">
          {subtitle}
        </div>
      </div>

      {/* Sparkline Visual */}
      <div className="flex items-end gap-1 h-12 self-end mb-1 opacity-20 group-hover:opacity-40 transition-opacity">
        {sparkline.map((h, i) => (
          <div
            key={i}
            className="w-1.5 bg-[#1a1d24] rounded-sm transition-all duration-700 ease-out"
            style={{
              height: `${h}%`,
              transitionDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  );
}
