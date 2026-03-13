'use client';

export function Footer() {
  return (
    <footer className="w-full bg-[#181622] pt-12 pb-16 px-6 sm:px-12 md:px-16 relative z-20 border-t border-[#F0ECE4]/10">
      <div className="max-w-7xl mx-auto flex flex-col gap-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="flex flex-col gap-6">
            <span className="text-[1.15rem] tracking-tight text-[#F0ECE4] font-['Spectral'] font-light uppercase flex items-center gap-2">
              Asatenas
            </span>
            <p className="font-['DM_Sans'] text-sm text-[#6A6080] max-w-[320px] font-light leading-relaxed">
              Plataforma premium para gestão de cirurgias e avaliação clínica
              pré-operatória.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-['DM_Sans'] text-[10px] text-[#6A6080] uppercase tracking-widest font-medium">
              Empresa
            </span>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="font-['DM_Sans'] text-sm text-[#6A6080] hover:text-[#F0ECE4] transition-colors text-left"
            >
              Sobre nós
            </button>
            <a
              href="mailto:suporte@asatenas.com.br"
              className="font-['DM_Sans'] text-sm text-[#6A6080] hover:text-[#F0ECE4] transition-colors"
            >
              Fale Conosco
            </a>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="font-['DM_Sans'] text-sm text-[#6A6080] hover:text-[#F0ECE4] transition-colors text-left"
            >
              Termos de Uso
            </button>
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="font-['DM_Sans'] text-sm text-[#6A6080] hover:text-[#F0ECE4] transition-colors text-left"
            >
              Política de Privacidade
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-[#F0ECE4]/10 pt-8">
          <div className="flex flex-col gap-1">
            <div className="font-['JetBrains_Mono'] text-[10px] text-[#6A6080] uppercase tracking-wider">
              2025 Asatenas Health.
            </div>
            <div className="font-['DM_Sans'] text-[11px] text-[#6A6080]/50">
              Asatenas Soluções em Software Médicos LTDA &middot; CNPJ
              64.369.863/0001-13
            </div>
          </div>
          <div className="flex items-center gap-4 bg-[rgba(240,236,228,0.03)] px-5 py-2.5 rounded-full border border-[#F0ECE4]/10">
            {/* Status Indicator */}
            <div className="relative flex items-center justify-center pt-[1px]">
              <div className="size-2 rounded-full bg-[#2EBA8A]" />
              <div className="absolute inset-0 size-2 rounded-full bg-[#2EBA8A] animate-ping opacity-40" />
            </div>
            <span className="font-['JetBrains_Mono'] text-[10px] text-[#F0ECE4]/60 uppercase tracking-widest">
              Status do Sistema
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
