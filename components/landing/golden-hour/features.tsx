export function Features() {
  return (
    <div id="features" className="w-full flex justify-between gap-12 sm:gap-6 flex-wrap lg:flex-nowrap pb-20">
      <FeatureCard
        number="01"
        title="Fluxo Completo"
        description="Gerencie todo o processo cirúrgico, da admissão inicial até a alta médica."
      />

      <FeatureCard
        number="02"
        title="Triagem Inteligente"
        description="Inteligência artificial capaz de identificar automaticamente pacientes que exigem atenção especial."
      />

      <FeatureCard
        number="03"
        title="Colaboração Clínica"
        description="Conecte anestesistas, cirurgiões e enfermagem em uma base unificada."
      />
    </div>
  );
}

function FeatureCard({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="flex flex-col group flex-1 min-w-[200px] border-t border-[#1a1d24]/10 pt-6">
      <span className="font-['JetBrains_Mono'] text-[10px] text-[#1a1d24]/30 mb-4 transition-colors group-hover:text-[#b87333]">
        {number}
      </span>
      <h3 className="font-['Fraunces'] text-xl sm:text-2xl text-[#1a1d24] mb-3">
        {title}
      </h3>
      <p className="font-['DM_Sans'] text-[14px] text-[#1a1d24]/50 leading-relaxed font-light">
        {description}
      </p>
    </div>
  );
}
