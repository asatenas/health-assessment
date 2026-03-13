'use client';

export function DataCards() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Featured Card */}
      <DiagnosticCard
        title="Impacto Financeiro"
        value="R$ 2.4M"
        subtitle="Economia média anual projetada"
        isFeatured={true}
      />

      {/* Standard Card 1 */}
      <DiagnosticCard
        title="Redução de Atrasos"
        value="-64%"
        subtitle="Cancelamentos de última hora"
      />

      {/* Standard Card 2 */}
      <DiagnosticCard
        title="Avaliações"
        value="18k+"
        subtitle="Processadas pela plataforma"
      />
    </div>
  );
}

function DiagnosticCard({
  title,
  value,
  subtitle,
  isFeatured = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  isFeatured?: boolean;
}) {
  return (
    <div
      className={`group flex items-center justify-between p-6 rounded-[20px] transition-all duration-300 transform hover:translate-x-1 cursor-default relative overflow-hidden ${
        isFeatured
          ? 'bg-[rgba(212,144,106,0.08)] border border-[rgba(212,144,106,0.2)] hover:border-[rgba(212,144,106,0.4)]'
          : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(212,144,106,0.3)]'
      }`}
    >
      {/* Background glow on hover */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(212,144,106,0.1),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Content */}
      <div className="flex flex-col z-10 w-full">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-7 rounded-[8px] bg-[rgba(212,144,106,0.12)] flex items-center justify-center">
            <div className={`size-1.5 rounded-full ${isFeatured ? 'bg-[#D4906A]' : 'bg-[#6A6080]'}`} />
          </div>
          <span className="font-['Albert_Sans'] text-[10px] tracking-widest text-[#6A6080] uppercase font-medium">
            {title}
          </span>
        </div>

        <div className="font-['Spectral'] text-[32px] sm:text-[40px] text-[#F0ECE4] leading-none mb-2 font-light tracking-tight">
          {value}
        </div>

        <div className="font-['Albert_Sans'] text-[11px] text-[#D4906A] font-medium tracking-wide">
          {subtitle}
        </div>
      </div>
    </div>
  );
}
