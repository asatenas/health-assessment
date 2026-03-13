export function Features() {
  return (
    <div id="features" className="w-full bg-white max-w-[1400px] mx-auto px-6 sm:px-12 md:px-16 pt-12 pb-8">

      <div className="flex items-center gap-4 mb-12 md:pl-16">
        <div className="w-8 h-[1px] bg-[#0A1628]/30" />
        <span className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-[0.2em]">01 — Arquitetura</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#0A1628]/[0.12] -ml-6 md:ml-0 md:-mx-16">

        <FeatureCard
          title="Fluxo Completo"
          description="Gerenciamento ponta a ponta sem planilhas ou sistemas fragmentados. Da admissão à liberação hospitalar."
          className="pl-6 md:pl-16 pr-6 md:pr-12 py-8 md:py-0"
        />

        <FeatureCard
          title="Triagem Inteligente"
          description="Modelos de risco HAS-2 e RCRI automatizados apontam pacientes que necessitam de cuidados especiais."
          className="px-6 md:px-12 py-8 md:py-0"
        />

        <FeatureCard
          title="Consenso Clínico"
          description="Enfermagem, anestesistas e cirurgiões unificados na mesma base de verdade, eliminando ruídos."
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
