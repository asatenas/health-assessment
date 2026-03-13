'use client';

export function DataPanel() {
  return (
    <div className="w-full bg-white border border-[#0A1628]/[0.12] rounded-none">
      {/* Panel Header */}
      <div className="px-6 py-4 border-b border-[#0A1628]/[0.12] flex items-center justify-between">
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-widest text-[#0A1628]/30">
          Monitoramento em Tempo Real
        </span>
        <div className="flex gap-2">
           <div className="border border-[#0A1628]/30 text-[#0A1628]/50 px-2 py-0.5 text-[9px] font-['JetBrains_Mono'] uppercase tracking-wider">Ativo</div>
        </div>
      </div>

      {/* Rows */}
      <div className="flex flex-col">
        <PanelRow
          label="ALERTA IMINENTE"
          value="RISCO HAS-2"
          tagMuted="Prioridade"
        />

        <PanelRow
          label="AVALIAÇÕES PENDENTES"
          value="14 PACIENTES"
          tagMuted="Aguardando"
        />

        <PanelRow
          label="TAXA DE OCUPAÇÃO"
          value="92.4%"
          tagMuted="Estável"
          isLast
        />
      </div>
    </div>
  );
}

function PanelRow({
  label,
  value,
  tagPrimary,
  tagMuted,
  isLast = false
}: {
  label: string;
  value: string;
  tagPrimary?: string;
  tagMuted?: string;
  isLast?: boolean;
}) {
  return (
    <div className={`px-6 py-5 flex items-center justify-between transition-colors hover:bg-[#0A1628]/[0.06] ${!isLast ? 'border-b border-[#0A1628]/[0.06]' : ''}`}>
      <div className="flex flex-col gap-1">
        <span className="font-['JetBrains_Mono'] text-[11px] uppercase text-[#0A1628]/50 tracking-wider">
          {label}
        </span>
        <span className="font-['Libre_Baskerville'] text-xl text-[#0A1628]">
          {value}
        </span>
      </div>

      {tagPrimary && (
        <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider px-2 py-1 bg-[#0A1628] text-white rounded-none">
          {tagPrimary}
        </span>
      )}

      {tagMuted && (
        <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider px-2 py-1 border border-[#0A1628]/30 text-[#0A1628]/50 rounded-none">
          {tagMuted}
        </span>
      )}
    </div>
  );
}
