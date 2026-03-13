export function Features() {
  return (
    <div id="features" className="w-full flex justify-between gap-10 flex-col sm:flex-row pb-12">
      <FeatureCard
        number="01"
        title="Avaliação Pré-Anestésica"
        description="Nossa equipe conduz a avaliação diretamente com o paciente antes da cirurgia."
      />

      <FeatureCard
        number="02"
        title="Zero Variabilidade"
        description="Garantimos que seu paciente chegue pronto e adequado no dia da cirurgia."
      />

      <FeatureCard
        number="03"
        title="Faturamento Sem Surpresas"
        description="Cirurgias concluídas com previsibilidade clínica e financeira do início ao fim."
      />
    </div>
  );
}

function FeatureCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col group flex-1">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-['Albert_Sans'] text-[10px] text-[#6A6080] tracking-widest uppercase transition-colors group-hover:text-[#D4906A]">
          {number}
        </span>
        <div className="h-[1px] w-full bg-[#F0ECE4]/10 group-hover:bg-[#D4906A]/30 transition-colors" />
      </div>
      <h3 className="font-['Spectral'] text-[22px] text-[#F0ECE4] mb-2 font-light">
        {title}
      </h3>
      <p className="font-['DM_Sans'] text-[14px] text-[#6A6080] leading-[1.6] font-light">
        {description}
      </p>
    </div>
  );
}
