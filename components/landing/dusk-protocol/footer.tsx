export function Footer() {
  return (
    <footer className="w-full bg-[#181622] pt-12 pb-16 px-6 sm:px-12 md:px-16 relative z-20 border-t border-[#F0ECE4]/10">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div className="flex flex-col gap-6">
          <span className="text-[1.15rem] font-bold tracking-tight text-[#F0ECE4] font-['Spectral'] font-light uppercase flex items-center gap-2">
            <div className="size-2.5 rounded-sm bg-[#D4906A]" />
            Asatenas
          </span>
          <p className="font-['DM_Sans'] text-sm text-[#6A6080] max-w-[320px] font-light leading-relaxed">
            Plataforma premium para gestão e avaliação clínica pré-operatória.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6">
          <div className="flex items-center gap-4 bg-[rgba(240,236,228,0.03)] px-5 py-2.5 rounded-full border border-[#F0ECE4]/10">
            {/* Status Indicator White Dot at 40% opacity (no green per spec) */}
            <div className="relative flex items-center justify-center">
              <div className="size-2 rounded-full bg-white opacity-40" />
              <div className="absolute inset-0 size-2 rounded-full bg-white animate-ping opacity-20" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#F0ECE4]/60 uppercase tracking-widest">
              Status do Sistema
            </span>
          </div>

          <div className="font-['JetBrains_Mono'] text-[10px] text-[#6A6080] uppercase tracking-wider">
            © {new Date().getFullYear()} Asatenas Health.
          </div>
        </div>
      </div>
    </footer>
  );
}
