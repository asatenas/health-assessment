import { Navbar } from './navbar';
import { Hero } from './hero';
import { Features } from './features';
import { DataCards } from './cards';
import { Pricing } from './pricing';
import { Footer } from './footer';

export function DuskProtocolVariant() {
  return (
    <div className="min-h-screen bg-[#181622] text-[#F0ECE4] font-sans overflow-x-hidden selection:bg-[#D4906A]/20 relative">
      {/* Background orbs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(212,144,106,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(106,96,128,0.07)_0%,transparent_70%)] pointer-events-none" />

      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent 2px, rgba(212,144,106,0.02) 4px)'
        }}
      />

      <Navbar />

      <main className="relative z-10 w-full flex flex-col lg:min-h-screen">
        <div className="max-w-7xl mx-auto w-full px-6 sm:px-12 md:px-16 flex flex-col lg:flex-row gap-16 lg:gap-8 items-center lg:items-stretch relative z-10 lg:flex-1">

          {/* Left Column: Hero Copy + Features */}
          <div className="flex-1 flex flex-col max-w-[600px] xl:max-w-[700px] w-full lg:flex-shrink-0">
            {/* Hero Section - Full View on Mobile */}
            <div className="flex flex-col justify-center min-h-[100dvh] lg:min-h-0 pt-32 pb-16 lg:pt-24 lg:pb-0">
              <Hero />
            </div>

            {/* Features Section */}
            <div className="flex flex-col justify-center mt-12 lg:mt-20 pb-12 lg:pb-24 border-t border-[#F0ECE4]/5 lg:border-none pt-12 lg:pt-0">
              <Features />
            </div>
          </div>

          {/* Right Column: Data Cards */}
          <div className="w-full lg:w-[480px] xl:w-[520px] flex-shrink-0 flex flex-col justify-center pt-8 pb-20 lg:py-24 lg:pl-12">
            <DataCards />
          </div>

        </div>
      </main>

      <Pricing />

      <Footer />
    </div>
  );
}
