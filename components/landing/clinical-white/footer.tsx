export function Footer() {
  return (
    <footer className="w-full bg-[#0A1628] text-white pt-16 pb-20 px-6 sm:px-12 md:px-16 border-t border-[#0A1628]">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-16">
        <div className="flex flex-col gap-6 max-w-[400px]">
          <span className="text-xl font-bold tracking-tight text-white font-['Libre_Baskerville'] uppercase flex items-center gap-3">
            Asatenas
          </span>
          <p className="font-['Figtree'] text-[15px] text-white/50 leading-relaxed max-w-[320px]">
            Auditoria, avaliação e autorização cirúrgica. Sem intervenção humana manual.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-8">
          <div className="flex items-center gap-4 bg-white/5 px-6 py-3 border border-white/10 rounded-none">
            {/* Status Indicator Green Dot */}
            <div className="relative flex items-center justify-center">
              <div className="size-2 bg-[#2EBA8A] rounded-none" />
              <div className="absolute inset-0 size-2 bg-[#2EBA8A] animate-ping opacity-40 rounded-none" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-white/60 uppercase tracking-widest">
              Sistemas Operacionais
            </span>
          </div>

          <div className="font-['JetBrains_Mono'] text-[10px] text-white/50 uppercase tracking-widest flex items-center gap-6">
            <span>2025 Asatenas Health.</span>
            <span className="hidden sm:inline-block">Todos os direitos reservados.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
