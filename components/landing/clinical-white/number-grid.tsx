export function NumberGrid() {
  return (
    <div className="grid grid-cols-2 gap-[1px] bg-[#0A1628]/[0.12] border border-[#0A1628]/[0.12]">
      
      {/* Cell 1 */}
      <div className="bg-[#F0F2F5] hover:bg-white transition-colors p-8 flex flex-col justify-center items-center text-centeraspect-square md:aspect-auto md:h-64">
        <div className="font-['Libre_Baskerville'] text-4xl sm:text-5xl text-[#0A1628] mb-3">
          19.2%
        </div>
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-widest max-w-[120px]">
          Redução em Tempo Ocioso
        </div>
      </div>

      {/* Cell 2 */}
      <div className="bg-[#F0F2F5] hover:bg-white transition-colors p-8 flex flex-col justify-center items-center text-center aspect-square md:aspect-auto md:h-64">
        <div className="font-['Libre_Baskerville'] text-4xl sm:text-5xl text-[#0A1628] mb-3">
          7
        </div>
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-widest max-w-[120px]">
          Dias de Previsibilidade
        </div>
      </div>

      {/* Cell 3 */}
      <div className="bg-[#F0F2F5] hover:bg-white transition-colors p-8 flex flex-col justify-center items-center text-center aspect-square md:aspect-auto md:h-64">
        <div className="font-['Libre_Baskerville'] text-4xl sm:text-5xl text-[#0A1628] mb-3">
          4.5x
        </div>
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-widest max-w-[120px]">
          ROI no Primeiro Ano
        </div>
      </div>

      {/* Cell 4 */}
      <div className="bg-[#F0F2F5] hover:bg-white transition-colors p-8 flex flex-col justify-center items-center text-center aspect-square md:aspect-auto md:h-64">
        <div className="font-['Libre_Baskerville'] text-4xl sm:text-5xl text-[#0A1628] mb-3">
          Zero
        </div>
        <div className="font-['JetBrains_Mono'] text-[10px] uppercase text-[#0A1628]/30 tracking-widest max-w-[120px]">
          Intervenção Manual
        </div>
      </div>

    </div>
  );
}
