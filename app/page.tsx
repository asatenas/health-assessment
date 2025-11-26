'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header/Navigation */}
      <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="relative w-[200px] h-[50px] overflow-hidden flex items-center justify-center">
                <Image
                  src="/images/logo_full_v2.png"
                  alt="Asatenas Health"
                  width={200}
                  height={200}
                  className="min-w-[220px] object-cover object-center"
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-cyan-200 via-white to-cyan-100 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex justify-center">
            <div className="max-w-4xl space-y-8 text-center">
              <div
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: 'rgba(150, 226, 233, 0.5)',
                  color: '#008E9B',
                }}
              >
                Feito para cirurgiões
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Revolucionando a estratificação de risco cirúrgico.
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Automatize a coleta de dados pré-operatórios com nossos índices
                inteligentes (RCRI e AUB-HAS2). Mais segurança para o paciente,
                menos burocracia para sua equipe.
              </p>
              <div className="flex justify-center">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 text-white shadow-lg transition-all hover:scale-105"
                    style={{ backgroundColor: '#2cc1ce' }}
                  >
                    Começar
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Triagem automática por IA
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    100% seguro e confidencial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section
        id="funcionalidades"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Análise Clínica Profunda
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Dois índices para uma avaliação mais completa e precisa do risco
              cirúrgico
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* RCRI Card */}
            <div
              className="group relative bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-2xl p-8 border transition-all duration-300"
              style={{ borderColor: '#2cc1ce' }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  RCRI
                </h3>
                <div
                  className="text-sm font-medium"
                  style={{ color: '#2cc1ce' }}
                >
                  Revised Cardiac Risk Index for Pre-Operative Risk
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#2cc1ce' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Avaliação de cirurgia de alto risco
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#2cc1ce' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Histórico de doença cardíaca isquêmica
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#2cc1ce' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Insuficiência cardíaca congestiva
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#2cc1ce' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Doença cerebrovascular e diabetes
                  </span>
                </li>
              </ul>
            </div>

            {/* AUB-HAS2 Card */}
            <div
              className="group relative bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-8 border transition-all duration-300"
              style={{ borderColor: '#7dd4dc' }}
            >
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  AUB-HAS2
                </h3>
                <div
                  className="text-sm font-medium"
                  style={{ color: '#7dd4dc' }}
                >
                  American University of Beirut Cardiovascular Risk Index
                </div>
              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#7dd4dc' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Verificação do nível de hemoglobina
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#7dd4dc' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Sinais de dor torácica compatível com isquemia
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#7dd4dc' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Falta de ar sugestiva de causa cardíaca
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 mt-0.5 shrink-0"
                    style={{ color: '#7dd4dc' }}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-300">
                    Cirurgias vasculares de maior risco
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Patient Safety Section */}
      <section
        id="seguranca"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Segurança do Paciente
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Detecção inteligente de fatores críticos para a segurança do
              procedimento cirúrgico
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Medications */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-shadow">
              <div
                className="w-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(150, 226, 233, 0.2)' }}
              >
                <svg
                  className="w-7"
                  style={{ color: '#2cc1ce' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Medicações Contínuas
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Identifica medicamentos em uso e calcula automaticamente os dias
                necessários de suspensão pré-operatória, garantindo segurança e
                eficácia do procedimento.
              </p>
            </div>

            {/* Allergies */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-shadow">
              <div className="w-14 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mb-4">
                <svg
                  className="w-7 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Alergias Importantes
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Detecta alergias críticas como látex, iodo e medicamentos
                específicos, prevenindo reações adversas graves durante a
                cirurgia.
              </p>
            </div>

            {/* Medical Devices */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-shadow">
              <div
                className="w-14 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: 'rgba(125, 212, 220, 0.2)' }}
              >
                <svg
                  className="w-7"
                  style={{ color: '#7dd4dc' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Dispositivos Médicos
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                Identifica presença de marcapassos, bombas de medicação e outros
                dispositivos implantáveis que impactam o planejamento cirúrgico.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="precos"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Plano Simples e Transparente
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Tudo que você precisa para revolucionar sua estratificação de
              risco
            </p>
          </div>
          <div className="max-w-lg mx-auto">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl blur-xl opacity-20"
                style={{
                  background: 'linear-gradient(to right, #2cc1ce, #7dd4dc)',
                }}
              />
              <div
                className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 overflow-hidden"
                style={{ borderColor: '#2cc1ce' }}
              >
                <div
                  className="px-8 py-6"
                  style={{
                    background: 'linear-gradient(to right, #2cc1ce, #7dd4dc)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        Plano Mensal
                      </h3>
                      <p className="text-cyan-100 mt-1">
                        Acesso completo à plataforma
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-start">
                        <span className="text-2xl font-bold text-white mt-1">
                          R$
                        </span>
                        <span className="text-6xl font-bold text-white">
                          99
                        </span>
                        <span className="text-xl font-bold text-white mt-1">
                          ,99
                        </span>
                      </div>
                      <div className="text-cyan-100 text-sm">/mês</div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Avaliações ilimitadas
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Crie quantos chats de pacientes precisar
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Cálculo automático RCRI e AUB-HAS2
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Índices inteligentes com IA
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Triagem inteligente por IA
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Coleta automática de dados pré-operatórios
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Link compartilhável com pacientes
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Envie o link automaticamente por email
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Dashboard de gerenciamento
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Acompanhe todos os seus pacientes
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <svg
                        className="w-6 mt-0.5 shrink-0"
                        style={{ color: '#2cc1ce' }}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          Segurança e confidencialidade
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Anonimização e criptografia em conformidade com a LGPD
                        </div>
                      </div>
                    </li>
                  </ul>
                  <Link href="/register" className="block">
                    <Button
                      size="lg"
                      className="w-full text-lg py-6 text-white shadow-lg transition-all"
                      style={{
                        background:
                          'linear-gradient(to right, #2cc1ce, #7dd4dc)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(to right, #26adb9, #6bc4cd)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          'linear-gradient(to right, #2cc1ce, #7dd4dc)';
                      }}
                    >
                      Começar Agora
                    </Button>
                  </Link>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    7 dias grátis para testar, sem cartão de crédito. Cancele
                    quando quiser, sem multas ou taxas extras.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="py-20 px-4 sm:px-6 lg:px-8"
        style={{ background: 'linear-gradient(to right, #2cc1ce, #7dd4dc)' }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para revolucionar sua estratificação de risco?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Junte-se às clínicas e hospitais que já confiam na Asatenas Health
            para garantir mais segurança aos seus pacientes.
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="text-lg px-8 py-6 bg-white hover:bg-gray-100 shadow-xl transition-all"
              style={{ color: '#2cc1ce' }}
            >
              Criar Conta Gratuitamente
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold text-white mb-4">
                Asatenas Health
              </div>
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
                <li>
                  {/* biome-ignore lint/a11y/useButtonType: <explanation> */}
                  <button
                    onClick={() => {
                      document
                        .getElementById('precos')
                        ?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Preços
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
            <p>&copy; 2025 Asatenas Health. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
