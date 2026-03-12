export function Features() {
  return (
    <div id="features" className="w-full flex justify-between gap-10 flex-col sm:flex-row pb-12">
      <FeatureCard 
        number="01"
        title="Fluxo Unificado"
        description="Gerencie todo o processo da admissão à alta."
      />
      
      <FeatureCard 
        number="02"
        title="Triagem com IA"
        description="Identifique pacientes que exigem atenção especial."
      />
      
      <FeatureCard 
        number="03"
        title="Time Integrado"
        description="Sincronize cirurgiões e anestesistas em tempo real."
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
