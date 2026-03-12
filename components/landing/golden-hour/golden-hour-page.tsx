import { Navbar } from './navbar';
import { Hero } from './hero';
import { Features } from './features';
import { DataRail } from './data-rail';
import { MetricsBar } from './metrics-bar';
import { Footer } from './footer';

export function GoldenHourVariant() {
  return (
    <div className="min-h-screen bg-[#f5f4f0] text-[#1a1d24] font-sans overflow-x-hidden selection:bg-[#b87333]/20">
      <Navbar />

      <main className="relative z-10 w-full flex flex-col md:flex-row min-h-[100dvh]">
        {/* Left Content Column */}
        <div className="flex-1 flex flex-col pt-32 pb-16 px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 max-w-5xl relative z-10">
          <Hero />
          
          <div className="mt-32 w-full">
            <Features />
          </div>

          {/* Metrics bar locked to bottom of left column content */}
          <div className="mt-auto pt-24 w-full">
            <MetricsBar />
          </div>
        </div>

        {/* Vertical divider */}
        <div className="hidden md:block w-[1px] bg-[#1a1d24]/10 h-full fixed top-0 right-[380px] z-0" />

        {/* Right Data Rail (Sidebar layout signature) */}
        <div className="w-full md:w-[380px] md:min-w-[380px] bg-[#eeece6] flex-shrink-0 relative z-20 md:border-l-0 border-t border-[#1a1d24]/10 md:border-t-0 p-6 sm:p-8 pt-12 md:pt-32">
          <DataRail />
        </div>
      </main>

      <Footer />
    </div>
  );
}
