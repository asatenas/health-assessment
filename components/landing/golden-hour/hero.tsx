"use client";

export function Hero() {
  return (
    <div className="flex flex-col pt-16 md:pt-24 lg:pt-32 max-w-[460px]">
      {/* Kicker label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-6 bg-[#1a1d24]/35" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase tracking-[0.2em] text-[#1a1d24]/35 font-medium">
          Sistema de Gestão
        </span>
      </div>

      {/* Four-line Fraunces headline */}
      <h1 className="font-['Fraunces'] text-5xl sm:text-6xl lg:text-[76px] leading-[1.05] tracking-[-0.02em] text-[#1a1d24] mb-8">
        <span className="block opacity-90">Recupere</span>
        <span className="block opacity-90">milhões.</span>
        <span className="block text-[#b87333] font-light italic mt-1">
          Reduza
        </span>
        <span className="block opacity-45 font-light italic">
          cancelamentos.
        </span>
      </h1>

      {/* Body text */}
      <p className="font-['DM_Sans'] text-base md:text-[17px] leading-relaxed text-[#1a1d24]/45 mb-10 max-w-[420px] font-light">
        A plataforma de avaliação de saúde pré-operatória projetada para identificar riscos precocemente.
        Mantenha suas salas cirúrgicas funcionando com precisão absoluta.
      </p>

      {/* CTA section with email form */}
      <div className="w-full relative mt-4">
        <form
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-[400px]"
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
          <div className="relative flex-1 group">
            <input
              type="email"
              name="email"
              placeholder="Seu e-mail profissional"
              required
              className="w-full bg-transparent border border-[#1a1d24]/10 rounded-[6px] px-4 py-3 text-sm font-['DM_Sans'] text-[#1a1d24] placeholder:text-[#1a1d24]/30 focus:outline-none focus:border-[#b87333]/40 focus:ring-1 focus:ring-[#b87333]/40 transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 bg-[#1a1d24] text-[#f5f4f0] text-xs font-semibold uppercase tracking-wider font-['Albert_Sans'] px-6 py-3.5 rounded-[6px] transition-all hover:-translate-y-px"
            style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', transitionDuration: '0.25s' }}
          >
            Acesso Antecipado
          </button>
        </form>
        <p className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#1a1d24]/30 mt-4 tracking-wider">
          Apenas 50 vagas no grupo beta
        </p>
      </div>
    </div>
  );
}
