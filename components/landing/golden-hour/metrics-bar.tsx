export function MetricsBar() {
  return (
    <div id="metrics" className="w-full border-t border-[#1a1d24]/[0.08] lg:-mr-32 relative z-30 bg-[#f5f4f0] pb-24">
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1a1d24]/[0.08]">
        
        <div className="flex flex-col py-8 sm:pr-8">
          <div className="font-['Fraunces'] text-[38px] text-[#b87333] italic tracking-[-0.02em] leading-none mb-3">
            -64%
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 font-medium tracking-[0.08em]">
            Cancelamentos de última hora
          </div>
        </div>

        <div className="flex flex-col py-8 sm:px-8">
          <div className="font-['Fraunces'] text-[38px] text-[#1a1d24] tracking-[-0.02em] leading-none mb-3">
            18k+
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 font-medium tracking-[0.08em]">
            Avaliações concluídas
          </div>
        </div>

        <div className="flex flex-col py-8 sm:pl-8">
          <div className="font-['Fraunces'] text-[38px] text-[#1a1d24] tracking-[-0.02em] leading-none mb-3">
            R$ 2.4M
          </div>
          <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 font-medium tracking-[0.08em]">
            Economia média anual
          </div>
        </div>

      </div>
    </div>
  );
}
