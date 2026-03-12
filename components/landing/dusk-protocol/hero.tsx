"use client";

export function Hero() {
  return (
    <div className="flex flex-col">
      {/* Kicker label */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-[1px] w-6 bg-[#D4906A]" />
        <span className="font-['Albert_Sans'] text-[11px] uppercase tracking-[0.2em] text-[#D4906A] font-medium">
          Protocolo Institucional
        </span>
      </div>

      {/* Headline */}
      <h1 className="font-['Spectral'] text-5xl sm:text-6xl lg:text-[72px] leading-[1.1] tracking-[-0.01em] text-[#F0ECE4] mb-8 font-light max-w-[640px]">
        O futuro da <br className="hidden sm:block" />
        <span className="text-[#D4906A] italic font-light">
          gestão cirúrgica
        </span>
        <br className="hidden sm:block" />
        <span className="text-[#6A6080] italic ml-2 sm:ml-0 text-3xl sm:text-5xl lg:text-[56px]">
          precisão absoluta em escala.
        </span>
      </h1>

      {/* Body text */}
      <p className="font-['DM_Sans'] text-base md:text-[17px] leading-[1.7] text-[#6A6080] mb-12 max-w-[480px] font-light">
        Identifique riscos antes que eles cancelem suas cirurgias. Uma plataforma de avaliação unificada que conecta médicos, pacientes e infraestrutura.
      </p>

      {/* CTA section */}
      <div className="w-full relative mt-2">
        <form
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full max-w-[460px]"
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
              placeholder="E-mail profissional"
              required
              className="w-full bg-[rgba(240,236,228,0.03)] border border-[rgba(240,236,228,0.1)] rounded-[8px] px-5 py-4 text-sm font-['DM_Sans'] text-[#F0ECE4] placeholder:text-[#6A6080] focus:outline-none focus:border-[#D4906A] focus:bg-[rgba(212,144,106,0.02)] transition-all"
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 bg-[linear-gradient(135deg,rgba(212,144,106,1)_0%,rgba(170,105,71,1)_100%)] text-[#181622] text-[11px] font-semibold uppercase tracking-wider font-['Albert_Sans'] px-7 py-4 rounded-[8px] transition-all hover:-translate-y-[2px]"
            style={{ 
              boxShadow: '0 4px 24px rgba(212,144,106,0.3)',
              transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', 
              transitionDuration: '0.25s' 
            }}
          >
            Acesso Antecipado
          </button>
        </form>
      </div>
    </div>
  );
}
