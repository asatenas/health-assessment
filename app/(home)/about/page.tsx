'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/90 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative w-[200px] h-[50px] overflow-hidden flex items-center justify-center select-none cursor-pointer">
                <Image
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }
                  src="/images/logo_full_v2.png"
                  alt="Asatenas Health"
                  width={200}
                  height={200}
                  className="min-w-[220px] object-cover object-center select-none pointer-events-auto"
                  draggable={false}
                />
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-black hover:bg-transparent hover:underline"
                >
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="text-black bg-[#2cc1ce]/80 hover:bg-[#2cc1ce]/70">
                  Criar Conta
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-white mb-4">Asatenas</div>
              <p className="text-gray-400 mb-4">
                Revolucionando a estratificação de risco cirúrgico com
                tecnologia e inteligência artificial.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Produto</h3>
              <ul className="space-y-2">
                <li>
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button
                    onClick={() => {
                      document
                        .getElementById('funcionalidades')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Funcionalidades
                  </button>
                </li>
                <li>
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button
                    onClick={() => {
                      document
                        .getElementById('seguranca')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Segurança
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    Sobre nós
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Asatenas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
