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

      <main className="relative z-10 w-full">
        {/* Hero — occupies only the left content area, full width on mobile */}
        <div className="pt-32 lg:pt-40 pb-24 px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 max-w-5xl mx-auto">
          <Hero />
        </div>

        {/* Features row + Data Rail — side by side on desktop */}
        <div className="flex flex-col md:flex-row min-h-[60vh] max-w-[1404px] mx-auto w-full">
          {/* Left: Features + MetricsBar */}
          <div id="features" className="flex-1 flex flex-col px-6 sm:px-12 md:px-16 lg:px-24 xl:px-32 max-w-5xl pb-24 pt-24">
            <Features />
            <div id="metrics" className="mt-auto pt-24 w-full">
              <MetricsBar />
            </div>
          </div>

          {/* Right: Data Rail */}
          <div className="w-full md:w-[380px] md:min-w-[380px] bg-[#eeece6] shrink-0 relative z-20 border-t border-[#1a1d24]/10 md:border-t-0 md:border-l md:border-l-[#1a1d24]/10 p-6 sm:p-8 pt-10 md:pt-12">
            <DataRail />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
