export function Footer() {
  return (
    <footer className="w-full bg-[#1a1d24] text-[#f5f4f0] py-16 px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div className="flex flex-col gap-6">
          <span className="text-xl font-bold tracking-tight text-[#f5f4f0] font-['Fraunces'] uppercase flex items-center gap-2">
            Asatenas
          </span>
          <p className="font-['DM_Sans'] text-sm text-[#f5f4f0]/40 max-w-[300px] font-light">
            Plataforma de inteligência para gestão pré-operatória e redução de cancelamentos cirúrgicos.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6">
          <div className="flex items-center gap-3 bg-[#f5f4f0]/5 px-4 py-2 rounded-full border border-[#f5f4f0]/10">
            {/* Status Indicator Green Dot pulse animation via Tailwind */}
            <div className="relative flex items-center justify-center">
              <div className="size-2 rounded-full bg-[#2EBA8A]" />
              <div className="absolute inset-0 size-2 rounded-full bg-[#2EBA8A] animate-ping opacity-50" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#f5f4f0]/70 uppercase tracking-widest">
              Sistemas Operacionais
            </span>
          </div>

          <div className="font-['JetBrains_Mono'] text-[10px] text-[#f5f4f0]/30 uppercase tracking-wider">
            2025 Asatenas Health.
          </div>
        </div>
      </div>
    </footer>
  );
}
