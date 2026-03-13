import { Navbar } from './navbar';
import { Hero } from './hero';
import { Features } from './features';
import { DataPanel } from './data-panel';
import { Footer } from './footer';

export function ClinicalWhiteVariant() {
  return (
    <div className="min-h-screen bg-white text-[#0A1628] font-sans overflow-x-hidden selection:bg-[#0A1628]/10">
      <Navbar />

      <main className="relative z-10 w-full flex flex-col min-h-[100dvh]">
        {/* Hero Section */}
        <div className="max-w-[1400px] mx-auto w-full pt-32 pb-16 px-6 sm:px-12 md:px-16 flex flex-col lg:flex-row items-stretch">

          {/* Left Column: Hero Copy */}
          <div className="flex-1 max-w-[700px] w-full pt-8 lg:pt-16 lg:pr-16 relative">
            <Hero />

            {/* 1px Vertical Rule dividing hero and panel */}
            <div className="hidden lg:block absolute top-[10%] bottom-0 right-0 w-[1px] bg-[#0A1628]/[0.12]" />
          </div>

          {/* Right Column: Data Panel */}
          <div className="w-full lg:w-[480px] xl:w-[560px] flex-shrink-0 pt-16 lg:pt-24 lg:pl-16">
            <DataPanel />
          </div>
        </div>

        {/* Features / Audience Strip */}
        <div className="bg-[#F0F2F5] border-t border-[#0A1628]/[0.12] w-full pt-16 pb-24">
          <Features />
        </div>
      </main>

      <Footer />
    </div>
  );
}
