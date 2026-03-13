export function Features() {
  return (
    <div id="features" className="w-full bg-white max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 pt-12 pb-8">

      <div className="flex items-center gap-4 mb-12 md:pl-16">
        <div className="w-8 h-[1px] bg-[#0A1628]/30" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-[0.2em]">01 — Plataforma</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#0A1628]/[0.12] -ml-6 md:ml-0 md:-mx-16">

        <FeatureCard
          title="Fluxo Completo"
          description="Nosso modelo faz todas as perguntas repetitivas do pré-operatório. Nunca mais esqueça um fator de risco relevante."
          className="pl-6 md:pl-16 pr-6 md:pr-12 py-8 md:py-0"
        />

        <FeatureCard
          title="Triagem Inteligente"
          description="Modelos de risco cardíaco automatizados identificam os pacientes que necessitam de atenção especial antes da cirurgia."
          className="px-6 md:px-12 py-8 md:py-0"
        />

        <FeatureCard
          title="Facilidade de Uso"
          description="Visualize as informações do paciente de forma estruturada e intuitiva, centralizadas em um único lugar."
          className="px-6 md:px-12 pr-6 md:pr-16 py-8 md:py-0"
        />

      </div>
    </div>
  );
}

function FeatureCard({ title, description, className }: { title: string, description: string, className?: string }) {
  return (
    <div className={`flex flex-col group ${className}`}>
      <h3 className="font-['Libre_Baskerville'] text-2xl text-[#0A1628] mb-4">
        {title}
      </h3>
      <p className="font-['Figtree'] text-[15px] text-[#0A1628]/50 leading-[1.8]">
        {description}
      </p>
    </div>
  );
}
