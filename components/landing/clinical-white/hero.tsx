"use client";

export function Hero() {
  return (
    <div className="flex flex-col">
      {/* Kicker label */}
      <div className="flex items-center gap-0 mb-8">
        <div className="h-[1px] w-6 bg-[#0A1628]/30 mr-4" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#0A1628]/50 font-medium">
          Sistema Operacional Cirúrgico
        </span>
      </div>

      {/* Headline (Libre Baskerville) */}
      <h1 className="font-['Libre_Baskerville'] text-[56px] sm:text-[72px] lg:text-[84px] leading-[1.05] tracking-[-0.02em] text-[#0A1628] mb-12 max-w-[600px]">
        Eficiência cirúrgica sem <br />
        <span className="italic text-[#0A1628]/50 font-normal">compromisso.</span>
      </h1>

      {/* Stat Rule Strip */}
      <div className="flex items-center w-full max-w-[540px] border-y border-[#0A1628]/[0.12] py-4 mb-10 divide-x divide-[#0A1628]/[0.12]">
        <div className="flex-1 pr-6 flex items-baseline gap-2">
          <span className="font-['Libre_Baskerville'] text-2xl text-[#0A1628]">60%</span>
          <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#0A1628]/30">redução em perdas</span>
        </div>
        <div className="flex-1 px-6 flex items-baseline gap-2">
          <span className="font-['Libre_Baskerville'] text-2xl text-[#0A1628]">18M</span>
          <span className="font-['JetBrains_Mono'] text-[9px] uppercase tracking-wider text-[#0A1628]/30">recuperados</span>
        </div>
      </div>

      {/* Body text */}
      <p className="font-['Figtree'] text-[15px] leading-[1.8] text-[#0A1628]/50 mb-14 max-w-[480px]">
        O Asatenas audita, avalia e autoriza o faturamento e a ocupação das salas cirúrgicas dos hospitais em tempo real, sem intervenção humana manual.
      </p>

      {/* Sharp CTA Form */}
      <div className="w-full relative">
        <form
          className="flex flex-col sm:flex-row items-stretch gap-0 w-full max-w-[480px]"
          onSubmit={(e) => {
            e.preventDefault();
            const input = e.currentTarget.elements.namedItem('email') as HTMLInputElement;
            if (input.value) {
              fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: input.value }),
              }).then(() => {
                input.value = '';
                alert('Obrigado! Entraremos em contato em breve.');
              });
            }
          }}
        >
          <input
            type="email"
            name="email"
            id="signup"
            placeholder="Endereço de e-mail institucional"
            required
            className="flex-1 bg-white border border-[#0A1628]/[0.12] px-5 py-4 text-sm font-['Figtree'] text-[#0A1628] placeholder:text-[#0A1628]/30 focus:outline-none focus:border-[#0A1628]/50 transition-colors rounded-none"
          />
          <button
            type="submit"
            className="bg-[#0A1628] text-white text-[11px] font-medium uppercase tracking-[0.1em] font-['JetBrains_Mono'] px-8 py-4 transition-colors hover:bg-[#0A1628]/80 rounded-none border border-[#0A1628]"
          >
            Acesso Antecipado
          </button>
        </form>
      </div>
    </div>
  );
}
